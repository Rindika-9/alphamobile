-- ============================================================================
-- Alpha Mobile — 001_security.sql
-- Run this ONCE in Supabase Dashboard → SQL Editor (as the default `postgres`
-- role). It is written to be safe to re-run.
--
-- What it does:
--   * profiles + admins tables, is_admin()
--   * new order columns (payment_status, discount, coupon_code, shipping,
--     screenshot_url, utr, customer_name, customer_phone) and
--     orders.customer_id as uuid → auth.users
--   * Row Level Security on products, orders, customers, profiles,
--     content_settings, admins
--   * storage buckets/policies: product-images (public read, admin write),
--     payment-proofs (private; customer uploads into "<user id>/...")
--   * place_order() RPC — the only way to create an order
--   * delete_my_account() RPC — Play Store account deletion
--   * Realtime on orders
--
-- It does NOT delete any rows or drop any table. It DOES drop old RLS
-- policies on the tables above (and old storage policies that mention the
-- product-images / payment-proofs buckets) so the new rules are the only ones.
-- ============================================================================

begin;

-- ─── ADMINS ─────────────────────────────────────────────────────────────────

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ─── PROFILES ───────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text,
  phone text,
  pincode text,
  address text,
  avatar text,
  joined text,
  created_at timestamptz not null default now()
);

-- Create the profile row automatically from sign-up metadata. This works even
-- when "Confirm email" is on (the user has no session yet at sign-up time).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := coalesce(new.raw_user_meta_data->>'name', '');
begin
  insert into public.profiles (id, name, email, phone, pincode, address, avatar, joined)
  values (
    new.id,
    v_name,
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'pincode',
    new.raw_user_meta_data->>'address',
    upper(left(v_name, 2)),
    to_char(now(), 'Mon YYYY')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── ORDERS: new columns ────────────────────────────────────────────────────

alter table public.orders add column if not exists payment_status text default 'pending';
alter table public.orders add column if not exists discount numeric default 0;
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists shipping numeric default 0;
alter table public.orders add column if not exists screenshot_url text;
alter table public.orders add column if not exists utr text;
alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists customer_phone text;

-- orders.customer_id → uuid referencing auth.users.
-- Old ids (e.g. "c-1719999999") are NOT thrown away: they are kept in
-- orders.legacy_customer_id.
do $$
declare
  v_type text;
begin
  select data_type into v_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'orders' and column_name = 'customer_id';

  if v_type is null then
    alter table public.orders add column customer_id uuid;

  elsif v_type <> 'uuid' then
    alter table public.orders rename column customer_id to legacy_customer_id;
    alter table public.orders add column customer_id uuid;
    update public.orders o
       set customer_id = o.legacy_customer_id::uuid
     where o.legacy_customer_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       and exists (select 1 from auth.users u where u.id = o.legacy_customer_id::uuid);

  else
    -- Already uuid: park ids that don't exist in auth.users so the FK can be added.
    alter table public.orders add column if not exists legacy_customer_id text;
    update public.orders o
       set legacy_customer_id = o.customer_id::text,
           customer_id = null
     where o.customer_id is not null
       and not exists (select 1 from auth.users u where u.id = o.customer_id);
  end if;
end $$;

alter table public.orders drop constraint if exists orders_customer_id_fkey;
alter table public.orders
  add constraint orders_customer_id_fkey
  foreign key (customer_id) references auth.users(id) on delete set null;

create index if not exists orders_customer_id_idx on public.orders (customer_id);

-- orders.date default (place_order does not send a date).
do $$
declare
  v_type text;
begin
  select data_type into v_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'orders' and column_name = 'date';

  if v_type is null then
    alter table public.orders add column date timestamptz default now();
  elsif v_type in ('timestamp with time zone', 'timestamp without time zone') then
    alter table public.orders alter column date set default now();
  else
    -- text column: keep the same ISO format the app always wrote.
    alter table public.orders
      alter column date set default to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
  end if;
end $$;

-- Order numbers (ORD-2026-10001, ORD-2026-10002, ...)
create sequence if not exists public.order_number_seq start with 10001;

-- Payment info for list views WITHOUT the old base64 screenshot.
-- Old rows stored {"method","utr","screenshot","customerName","customerPhone"}
-- as JSON text inside orders.payment. This returns that JSON minus the
-- screenshot, plus "hasScreenshot". Selected as a computed column:
--   .select('id, ..., payment_meta')
create or replace function public.payment_meta(o public.orders)
returns jsonb
language plpgsql
stable
as $$
declare
  j jsonb;
begin
  if o.payment is null then
    return null;
  end if;
  if left(o.payment, 1) <> '{' then
    return jsonb_build_object('method', o.payment);
  end if;
  begin
    j := o.payment::jsonb;
  exception when others then
    return jsonb_build_object('method', o.payment);
  end;
  return (j - 'screenshot') || jsonb_build_object('hasScreenshot', coalesce(j->>'screenshot', '') <> '');
end;
$$;

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────────────────────

-- Drop every existing policy on these tables (old "allow all" policies would
-- otherwise keep everything open, because policies are OR-ed together).
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('products', 'orders', 'customers', 'profiles', 'content_settings', 'admins')
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- products: anyone reads, only admin writes
alter table public.products enable row level security;
create policy products_read on public.products for select using (true);
create policy products_admin_insert on public.products for insert to authenticated with check (public.is_admin());
create policy products_admin_update on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy products_admin_delete on public.products for delete to authenticated using (public.is_admin());

-- content_settings: anyone reads, only admin writes
alter table public.content_settings enable row level security;
create policy content_read on public.content_settings for select using (true);
create policy content_admin_insert on public.content_settings for insert to authenticated with check (public.is_admin());
create policy content_admin_update on public.content_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy content_admin_delete on public.content_settings for delete to authenticated using (public.is_admin());

-- orders: customer reads own; admin reads/updates all.
-- Customers create orders ONLY through place_order() (it runs as definer and
-- always sets customer_id = auth.uid()). There is deliberately no INSERT
-- policy: a direct insert would let a client choose its own prices.
alter table public.orders enable row level security;
create policy orders_read_own_or_admin on public.orders for select to authenticated
  using (customer_id = auth.uid() or public.is_admin());
create policy orders_admin_update on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy orders_admin_delete on public.orders for delete to authenticated
  using (public.is_admin());

-- profiles: user reads/updates own row; admin reads all
alter table public.profiles enable row level security;
create policy profiles_read_own_or_admin on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy profiles_insert_own on public.profiles for insert to authenticated
  with check (id = auth.uid());
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- admins: a user can see whether they are an admin. Manage rows in SQL editor.
alter table public.admins enable row level security;
create policy admins_read_self on public.admins for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- customers (old table, no longer used by the app): admin only. Not dropped.
do $$
begin
  if to_regclass('public.customers') is not null then
    execute 'alter table public.customers enable row level security';
    execute 'create policy customers_admin_all on public.customers for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;
end $$;

-- ─── STORAGE ────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 2097152, array['image/*'])
on conflict (id) do update
  set public = false,
      file_size_limit = 2097152,
      allowed_mime_types = array['image/*'];

-- Drop old policies that mention these two buckets.
do $$
declare
  r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and (coalesce(qual, '') ~ '(product-images|payment-proofs)'
        or coalesce(with_check, '') ~ '(product-images|payment-proofs)')
  loop
    execute format('drop policy if exists %I on storage.objects', r.policyname);
  end loop;
end $$;

create policy product_images_read on storage.objects for select
  using (bucket_id = 'product-images');
create policy product_images_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
create policy product_images_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());
create policy product_images_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

create policy payment_proofs_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy payment_proofs_read_own_or_admin on storage.objects for select to authenticated
  using (bucket_id = 'payment-proofs'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy payment_proofs_delete_own_or_admin on storage.objects for delete to authenticated
  using (bucket_id = 'payment-proofs'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ─── place_order() ──────────────────────────────────────────────────────────
-- p_items: [{"product_id": "p-123", "qty": 1}, ...]
-- Prices, coupon discount, shipping and total are all computed here from the
-- database. Anything price-like sent by the client is ignored.

create or replace function public.place_order(
  p_items jsonb,
  p_payment text,
  p_address text,
  p_customer_name text,
  p_customer_phone text,
  p_utr text default null,
  p_screenshot_path text default null,
  p_coupon_code text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_line record;
  v_prod public.products%rowtype;
  v_subtotal numeric := 0;
  v_items jsonb := '[]'::jsonb;
  v_settings jsonb;
  v_coupons jsonb;
  v_coupon jsonb;
  v_code text := upper(trim(coalesce(p_coupon_code, '')));
  v_pct numeric := 0;
  v_discount numeric := 0;
  v_fee numeric;
  v_free_above numeric;
  v_shipping numeric := 0;
  v_total numeric;
  v_id text;
  v_order public.orders;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'empty_cart';
  end if;

  if coalesce(trim(p_customer_name), '') = '' or coalesce(trim(p_customer_phone), '') = ''
     or coalesce(trim(p_address), '') = '' then
    raise exception 'missing_details';
  end if;

  if length(p_customer_name) > 200 or length(p_customer_phone) > 40 or length(p_address) > 1000 then
    raise exception 'details_too_long';
  end if;

  v_settings := coalesce((select value::jsonb from public.content_settings where key = 'payment_settings'), '{}'::jsonb);

  if p_payment = 'UPI Payment' then
    if coalesce(v_settings->>'enableUpi', 'true') = 'false' then
      raise exception 'payment_method_disabled';
    end if;
    if length(coalesce(trim(p_utr), '')) < 6 then
      raise exception 'invalid_utr';
    end if;
    if coalesce(p_screenshot_path, '') = '' or split_part(p_screenshot_path, '/', 1) <> v_uid::text then
      raise exception 'invalid_screenshot';
    end if;
  elsif p_payment = 'Cash On Delivery' then
    if coalesce(v_settings->>'enableCod', 'true') = 'false' then
      raise exception 'payment_method_disabled';
    end if;
  else
    raise exception 'invalid_payment_method';
  end if;

  -- Lines (duplicates merged; sorted so concurrent orders lock in the same order)
  for v_line in
    select e->>'product_id' as product_id, sum((e->>'qty')::int) as qty
    from jsonb_array_elements(p_items) e
    group by e->>'product_id'
    order by e->>'product_id'
  loop
    if v_line.product_id is null or v_line.qty is null or v_line.qty < 1 or v_line.qty > 100 then
      raise exception 'invalid_quantity';
    end if;

    select * into v_prod from public.products where id::text = v_line.product_id for update;
    if not found then
      raise exception 'product_not_found:%', v_line.product_id;
    end if;
    if coalesce(v_prod.stock, 0) < v_line.qty then
      raise exception 'out_of_stock:%', v_prod.name;
    end if;

    update public.products set stock = stock - v_line.qty where id = v_prod.id;

    v_subtotal := v_subtotal + v_prod.price * v_line.qty;
    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'product', jsonb_build_object(
        'id', v_prod.id,
        'name', v_prod.name,
        'brand', v_prod.brand,
        'category', v_prod.category,
        'price', v_prod.price,
        'originalPrice', v_prod.original_price,
        'rating', v_prod.rating,
        'reviews', v_prod.reviews,
        'image', v_prod.image,
        'stock', v_prod.stock - v_line.qty,
        'description', v_prod.description,
        'specs', v_prod.specs,
        'badge', v_prod.badge
      ),
      'qty', v_line.qty
    ));
  end loop;

  -- Coupon (from content_settings.coupons, same rule as the Cart screen)
  if v_code <> '' then
    v_coupons := coalesce((select value::jsonb from public.content_settings where key = 'coupons'), '[]'::jsonb);
    select c into v_coupon
    from jsonb_array_elements(case when jsonb_typeof(v_coupons) = 'array' then v_coupons else '[]'::jsonb end) c
    where upper(c->>'code') = v_code
    limit 1;
    if v_coupon is null then
      raise exception 'invalid_coupon';
    end if;
    v_pct := least(greatest(coalesce((v_coupon->>'discountPercent')::numeric, 0), 0), 100);
    v_discount := round(v_subtotal * v_pct / 100, 2);
  else
    v_code := null;
  end if;

  -- Shipping (from content_settings.payment_settings)
  v_fee := coalesce((v_settings->>'shippingFee')::numeric, 9.99);
  v_free_above := coalesce((v_settings->>'freeShippingAbove')::numeric, 0);
  v_shipping := case when v_free_above > 0 and v_subtotal > v_free_above then 0 else greatest(v_fee, 0) end;

  v_total := round(v_subtotal - v_discount + v_shipping, 2);

  -- Unique order id
  loop
    v_id := 'ORD-' || to_char(now(), 'YYYY') || '-' || nextval('public.order_number_seq')::text;
    exit when not exists (select 1 from public.orders where id::text = v_id);
  end loop;

  insert into public.orders (
    id, status, payment_status, items, total, address, payment,
    customer_id, utr, screenshot_url, customer_name, customer_phone,
    discount, coupon_code, shipping
  ) values (
    v_id, 'pending', 'pending', v_items, v_total, trim(p_address), p_payment,
    v_uid, nullif(trim(coalesce(p_utr, '')), ''), nullif(p_screenshot_path, ''),
    trim(p_customer_name), trim(p_customer_phone),
    v_discount, v_code, v_shipping
  )
  returning * into v_order;

  return v_order;
end;
$$;

revoke execute on function public.place_order(jsonb, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.place_order(jsonb, text, text, text, text, text, text, text) to authenticated;

-- ─── delete_my_account() ────────────────────────────────────────────────────
-- Deletes the caller's profile and auth user. Orders stay (customer_id is set
-- to null by the FK) for the shop's accounting records. The app removes the
-- user's payment screenshots from storage before calling this.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  delete from public.profiles where id = v_uid;
  delete from auth.users where id = v_uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ─── REALTIME ───────────────────────────────────────────────────────────────

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
     ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end $$;

commit;

-- After this, make yourself admin (see MANUAL_STEPS.md):
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'YOUR-ADMIN-EMAIL@gmail.com';
