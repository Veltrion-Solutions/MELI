-- MELI: customer orders with step-by-step tracking.
-- Run in Supabase: SQL Editor > paste > Run (or `supabase db push`).

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'placed'
    check (status in ('placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled')),
  payment text not null check (payment in ('cod', 'bank')),

  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text not null check (char_length(phone) between 9 and 20),
  address text not null check (char_length(address) between 5 and 300),
  city text not null check (char_length(city) between 2 and 80),
  district text not null,
  postcode text not null default '' check (char_length(postcode) <= 12),
  notes text not null default '' check (char_length(notes) <= 500),

  -- Snapshot of what was bought, priced from public.products at the time of the order.
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  subtotal integer not null check (subtotal >= 0),
  shipping integer not null check (shipping >= 0),
  total integer not null check (total >= 0),

  -- Set by admins as the order moves along.
  courier text not null default '' check (char_length(courier) <= 80),
  tracking_number text not null default '' check (char_length(tracking_number) <= 80),
  status_note text not null default '' check (char_length(status_note) <= 300),

  -- When each step was reached (filled in by the trigger below).
  placed_at timestamptz not null default now(),
  confirmed_at timestamptz,
  packed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  updated_at timestamptz not null default now()
);
create index orders_user_placed on public.orders (user_id, placed_at desc);
create index orders_status_placed on public.orders (status, placed_at desc);

alter table public.orders enable row level security;

create policy "Customers read their own orders; admins read all"
  on public.orders for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "Admins can update orders"
  on public.orders for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Orders are only created through place_order(); admins may only change the tracking fields.
revoke insert, update, delete on public.orders from anon, authenticated;
grant update (status, courier, tracking_number, status_note) on public.orders to authenticated;

-- Stamp the time of each step. Skipped steps are stamped too; moving back clears later ones.
create or replace function public.orders_track_status()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  steps constant text[] := array['placed', 'confirmed', 'packed', 'shipped', 'delivered'];
  pos int;
begin
  if new.status is distinct from old.status then
    if new.status = 'cancelled' then
      new.cancelled_at := now();
    else
      new.cancelled_at := null;
      pos := array_position(steps, new.status);
      new.confirmed_at := case when pos >= 2 then coalesce(old.confirmed_at, now()) end;
      new.packed_at    := case when pos >= 3 then coalesce(old.packed_at, now()) end;
      new.shipped_at   := case when pos >= 4 then coalesce(old.shipped_at, now()) end;
      new.delivered_at := case when pos >= 5 then coalesce(old.delivered_at, now()) end;
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger orders_track before update on public.orders
  for each row execute function public.orders_track_status();

-- Places an order for the signed-in customer. Prices, stock, shipping and the cash-on-delivery
-- limit are all checked here, so nothing the browser sends can change what is charged.
-- Shipping fees and limits mirror SHIPPING_RATES, DISTRICTS, FREE_SHIPPING_MIN and COD_MAX in lib/products.ts.
create or replace function public.place_order(
  p_items jsonb,
  p_name text,
  p_email text,
  p_phone text,
  p_address text,
  p_city text,
  p_district text,
  p_postcode text,
  p_notes text,
  p_payment text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  item jsonb;
  prod record;
  qty int;
  lines jsonb := '[]'::jsonb;
  v_subtotal int := 0;
  v_fee int;
  v_shipping int;
  v_total int;
  v_number text;
begin
  if uid is null then
    raise exception 'Please sign in to place your order.';
  end if;
  if p_payment not in ('cod', 'bank') then
    raise exception 'Please choose a payment method.';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your bag is empty.';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception 'Too many items in one order.';
  end if;

  v_fee := case
    when p_district = 'Colombo' then 350
    when p_district in ('Gampaha', 'Kalutara') then 400
    when p_district in ('Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Galle', 'Hambantota', 'Jaffna',
      'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu',
      'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya') then 450
  end;
  if v_fee is null then
    raise exception 'Please choose your district.';
  end if;

  for item in select * from jsonb_array_elements(p_items) loop
    qty := (item ->> 'qty')::int;
    if qty is null or qty < 1 or qty > 10 then
      raise exception 'Please check the quantities in your bag.';
    end if;
    select id, name, price, image, in_stock, colours into prod
      from public.products where id = item ->> 'id' and active;
    if not found then
      raise exception 'An item in your bag is no longer available. Please remove it and try again.';
    end if;
    if not ((item ->> 'size') = any (prod.in_stock)) then
      raise exception '% in size % has just sold out. Please update your bag.', prod.name, item ->> 'size';
    end if;
    if not (prod.colours @> jsonb_build_array(jsonb_build_object('name', item ->> 'colour'))) then
      raise exception '% is no longer available in that colour. Please update your bag.', prod.name;
    end if;
    lines := lines || jsonb_build_object(
      'id', prod.id, 'name', prod.name, 'image', prod.image, 'price', prod.price,
      'size', item ->> 'size', 'colour', item ->> 'colour', 'qty', qty
    );
    v_subtotal := v_subtotal + prod.price * qty;
  end loop;

  v_shipping := case when v_subtotal >= 12000 then 0 else v_fee end;
  v_total := v_subtotal + v_shipping;
  if p_payment = 'cod' and v_total > 30000 then
    raise exception 'Cash on delivery is available for orders up to Rs 30,000. Please choose bank transfer.';
  end if;

  loop
    v_number := 'MELI-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (select 1 from public.orders where number = v_number);
  end loop;

  insert into public.orders (number, user_id, payment, name, email, phone, address, city, district, postcode, notes,
                             items, subtotal, shipping, total)
  values (v_number, uid, p_payment, btrim(p_name), btrim(p_email), btrim(p_phone), btrim(p_address), btrim(p_city),
          p_district, btrim(coalesce(p_postcode, '')), btrim(coalesce(p_notes, '')), lines, v_subtotal, v_shipping, v_total);

  return v_number;
end;
$$;
revoke execute on function public.place_order(jsonb, text, text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.place_order(jsonb, text, text, text, text, text, text, text, text, text) to authenticated;
