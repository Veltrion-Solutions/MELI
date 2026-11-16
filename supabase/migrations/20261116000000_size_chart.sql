-- New size range (S to XXXXL, per the inch-based size chart). XS is retired.
alter table public.products drop constraint if exists products_in_stock_check;

update public.products set in_stock = array_remove(in_stock, 'XS');

alter table public.products
  add constraint products_in_stock_check
  check (in_stock <@ array['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL']);
