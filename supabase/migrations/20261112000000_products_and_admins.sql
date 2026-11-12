-- MELI: product catalogue editable by admins.
-- Run in Supabase: SQL Editor > paste > Run (or `supabase db push`).

-- ---------- Admins ----------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- A signed-in user may only see whether they themselves are an admin.
create policy "Users can read their own admin row"
  on public.admins for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Products ----------
create table public.products (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  name text not null check (char_length(name) between 1 and 120),
  price integer not null check (price >= 0),
  category text not null check (category in ('dresses', 'tops')),
  badge text check (badge in ('New', 'Best seller')),
  image text,
  hover_image text,
  gallery text[] not null default '{}',
  description text not null default '',
  details text[] not null default '{}',
  colours jsonb not null default '[]'::jsonb check (jsonb_typeof(colours) = 'array'),
  in_stock text[] not null default '{}' check (in_stock <@ array['XS', 'S', 'M', 'L', 'XL']),
  active boolean not null default true,
  sort integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;

create policy "Anyone can read visible products; admins read all"
  on public.products for select to anon, authenticated
  using (active or (select public.is_admin()));
create policy "Admins can add products"
  on public.products for insert to authenticated
  with check ((select public.is_admin()));
create policy "Admins can edit products"
  on public.products for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete products"
  on public.products for delete to authenticated
  using ((select public.is_admin()));

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------- Seed: the current catalogue ----------
insert into public.products (id, name, price, category, badge, image, hover_image, gallery, description, details, colours, in_stock, sort) values
('sierra-midi-dress', 'Sierra Midi Dress', 9400, 'dresses', 'New',
  '/images/sierra-midi-dress/front.png', '/images/sierra-midi-dress/pose.png',
  array['/images/sierra-midi-dress/front.png', '/images/sierra-midi-dress/pose.png', '/images/sierra-midi-dress/side.png', '/images/sierra-midi-dress/back.png'],
  'A button-front midi with a lace-trimmed V-neck, fitted empire waist and a soft A-line skirt with a front split.',
  array['Lightweight cotton-linen blend', 'Cap sleeves, covered buttons', 'Midi length with front split', 'Machine wash cold, gentle cycle'],
  '[{"name":"Butter","hex":"#f1e7b4"},{"name":"Ivory","hex":"#f6f1e7"},{"name":"Sage","hex":"#b9c4a7"}]',
  array['XS', 'S', 'M', 'L'], 1),
('elara-front-tie-top', 'Elara Front Tie Top', 8900, 'tops', 'New',
  '/images/elara-front-tie-top/front.png', '/images/elara-front-tie-top/seated.png',
  array['/images/elara-front-tie-top/front.png', '/images/elara-front-tie-top/seated.png', '/images/elara-front-tie-top/side.png', '/images/elara-front-tie-top/back.png', '/images/elara-front-tie-top/back-angle.png'],
  'A peplum top with puff sleeves, a lace-edged sweetheart neckline and double front ties.',
  array['Soft woven cotton', 'Elasticated puff sleeves', 'Fitted bodice with peplum hem', 'Hand wash cold'],
  '[{"name":"Powder blue","hex":"#a9bde3"},{"name":"White","hex":"#fbfbfb"}]',
  array['XS', 'S', 'M', 'L', 'XL'], 2),
('mia-puff-sleeve-top', 'Mia Puff Sleeve Top', 6500, 'tops', 'Best seller',
  '/images/mia-puff-sleeve-top/front.png', '/images/mia-puff-sleeve-top/side.png',
  array['/images/mia-puff-sleeve-top/front.png', '/images/mia-puff-sleeve-top/side.png'],
  'A square-neck button-front top with broderie lace trims and gathered puff sleeves.',
  array['Crisp cotton poplin', 'Covered front buttons', 'Lace trim at neck, cuffs and hem', 'Machine wash cold'],
  '[{"name":"White","hex":"#fbfbfb"},{"name":"Blush","hex":"#f1cfc8"}]',
  array['S', 'M', 'L'], 3),
('emi-ruffle-sleeve-top', 'Emi Ruffle Sleeve Top', 7200, 'tops', null,
  '/images/emi-ruffle-sleeve-top/front.png', '/images/emi-ruffle-sleeve-top/side.png',
  array['/images/emi-ruffle-sleeve-top/front.png', '/images/emi-ruffle-sleeve-top/side.png', '/images/emi-ruffle-sleeve-top/back.png'],
  'A corset-style V-neck top with ruffled flutter sleeves and a pleated peplum.',
  array['Structured cotton blend', 'Lace-trimmed neckline', 'Pleated peplum hem', 'Hand wash cold'],
  '[{"name":"Rose","hex":"#eeb4b8"},{"name":"Ivory","hex":"#f6f1e7"}]',
  array['XS', 'S', 'M'], 4),
('emora-shirt-dress', 'Emora Shirt Dress', 11800, 'dresses', 'Best seller',
  '/images/emora-shirt-dress/front.png', '/images/emora-shirt-dress/side.png',
  array['/images/emora-shirt-dress/front.png', '/images/emora-shirt-dress/side.png', '/images/emora-shirt-dress/back.png'],
  'A crisp mini shirt dress with a pintucked waist, rolled cuffs and a full skirt with side pockets.',
  array['Breathable cotton-linen', 'Pintucked fitted waist', 'Side pockets', 'Machine wash cold'],
  '[{"name":"White","hex":"#fbfbfb"},{"name":"Sand","hex":"#d9c6a8"},{"name":"Black","hex":"#1c1c1c"}]',
  array['S', 'M', 'L', 'XL'], 5);

-- ---------- Make someone an admin ----------
-- 1. They create a normal account at /login and confirm their email.
-- 2. Run (with their email):
--    insert into public.admins (user_id) select id from auth.users where email = 'owner@example.com';
