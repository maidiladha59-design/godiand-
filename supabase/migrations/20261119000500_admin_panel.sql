-- Akses panel admin Godiand.
-- Admin ditentukan manual lewat tabel public.admins (SQL Editor), bukan dari client.
-- Semua aksi sensitif memakai fungsi security definer yang mengecek is_admin().
-- Aman dijalankan ulang; data lama tidak dihapus.
-- Jalankan setelah 20261119000400_driver_app_access.sql.

create table if not exists public.admins (
  user_id uuid primary key references public.users (id) on delete cascade,
  role text not null default 'admin'
    check (role in ('admin', 'operator')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins a
    where a.user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

alter table public.admins enable row level security;

drop policy if exists "admins_select_own" on public.admins;
create policy "admins_select_own"
  on public.admins
  for select
  to authenticated
  using (user_id = (select auth.uid()));

revoke all on table public.admins from anon, authenticated;
grant select on table public.admins to authenticated;

-- Policy baca untuk admin. Tulis tetap lewat fungsi di bawah.
drop policy if exists "users_select_admin" on public.users;
create policy "users_select_admin"
  on public.users
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "places_select_admin" on public.places;
create policy "places_select_admin"
  on public.places
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "drivers_select_admin" on public.drivers;
create policy "drivers_select_admin"
  on public.drivers
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "merchants_select_admin" on public.merchants;
create policy "merchants_select_admin"
  on public.merchants
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "menu_items_select_admin" on public.menu_items;
create policy "menu_items_select_admin"
  on public.menu_items
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "fares_select_admin" on public.fares;
create policy "fares_select_admin"
  on public.fares
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "orders_select_admin" on public.orders;
create policy "orders_select_admin"
  on public.orders
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "order_items_select_admin" on public.order_items;
create policy "order_items_select_admin"
  on public.order_items
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "payments_select_admin" on public.payments;
create policy "payments_select_admin"
  on public.payments
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "sos_reports_select_admin" on public.sos_reports;
create policy "sos_reports_select_admin"
  on public.sos_reports
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "ratings_select_admin" on public.ratings;
create policy "ratings_select_admin"
  on public.ratings
  for select
  to authenticated
  using (public.is_admin());

-- Verifikasi driver. Driver dengan pesanan aktif tidak boleh dicabut.
create or replace function public.admin_set_driver_verified(
  p_driver_id uuid,
  p_verified boolean
)
returns public.drivers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_driver public.drivers;
begin
  if not public.is_admin() then
    raise exception 'Akses admin diperlukan.';
  end if;

  if not p_verified and exists (
    select 1
    from public.orders o
    where o.driver_id = p_driver_id
      and o.status in ('accepted', 'in_progress')
  ) then
    raise exception 'Driver masih punya pesanan aktif.';
  end if;

  update public.drivers
  set is_verified = p_verified,
      verified_at = case when p_verified then now() else null end,
      status = case when p_verified then status else 'offline' end
  where id = p_driver_id
  returning * into v_driver;

  if v_driver.id is null then
    raise exception 'Driver tidak ditemukan.';
  end if;

  return v_driver;
end;
$$;

revoke all on function public.admin_set_driver_verified(uuid, boolean)
  from public, anon, authenticated;
grant execute on function public.admin_set_driver_verified(uuid, boolean)
  to authenticated;

-- Verifikasi merchant.
create or replace function public.admin_set_merchant_verified(
  p_merchant_id uuid,
  p_verified boolean
)
returns public.merchants
language plpgsql
security definer
set search_path = public
as $$
declare
  v_merchant public.merchants;
begin
  if not public.is_admin() then
    raise exception 'Akses admin diperlukan.';
  end if;

  update public.merchants
  set is_verified = p_verified
  where id = p_merchant_id
  returning * into v_merchant;

  if v_merchant.id is null then
    raise exception 'Merchant tidak ditemukan.';
  end if;

  return v_merchant;
end;
$$;

revoke all on function public.admin_set_merchant_verified(uuid, boolean)
  from public, anon, authenticated;
grant execute on function public.admin_set_merchant_verified(uuid, boolean)
  to authenticated;

-- Status laporan SOS.
create or replace function public.admin_set_sos_status(
  p_report_id uuid,
  p_status text
)
returns public.sos_reports
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report public.sos_reports;
begin
  if not public.is_admin() then
    raise exception 'Akses admin diperlukan.';
  end if;

  if p_status not in ('open', 'acknowledged', 'resolved') then
    raise exception 'Status laporan tidak valid.';
  end if;

  update public.sos_reports
  set status = p_status,
      handled_by = (select auth.uid()),
      resolved_at = case when p_status = 'resolved' then now() else null end
  where id = p_report_id
  returning * into v_report;

  if v_report.id is null then
    raise exception 'Laporan SOS tidak ditemukan.';
  end if;

  return v_report;
end;
$$;

revoke all on function public.admin_set_sos_status(uuid, text)
  from public, anon, authenticated;
grant execute on function public.admin_set_sos_status(uuid, text)
  to authenticated;

-- Tarif baru. Riwayat tarif lama tetap disimpan.
create or replace function public.admin_create_fare(
  p_service_type text,
  p_base_fare integer,
  p_per_km integer,
  p_minimum_fare integer,
  p_max_distance_km numeric,
  p_effective_from date
)
returns public.fares
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fare public.fares;
begin
  if not public.is_admin() then
    raise exception 'Akses admin diperlukan.';
  end if;

  insert into public.fares (
    service_type, base_fare, per_km, minimum_fare,
    max_distance_km, effective_from, is_active
  )
  values (
    p_service_type, p_base_fare, p_per_km, p_minimum_fare,
    p_max_distance_km, p_effective_from, true
  )
  returning * into v_fare;

  return v_fare;
end;
$$;

revoke all on function public.admin_create_fare(
  text, integer, integer, integer, numeric, date
) from public, anon, authenticated;
grant execute on function public.admin_create_fare(
  text, integer, integer, integer, numeric, date
) to authenticated;

create or replace function public.admin_set_fare_active(
  p_fare_id uuid,
  p_active boolean
)
returns public.fares
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fare public.fares;
begin
  if not public.is_admin() then
    raise exception 'Akses admin diperlukan.';
  end if;

  update public.fares
  set is_active = p_active
  where id = p_fare_id
  returning * into v_fare;

  if v_fare.id is null then
    raise exception 'Tarif tidak ditemukan.';
  end if;

  return v_fare;
end;
$$;

revoke all on function public.admin_set_fare_active(uuid, boolean)
  from public, anon, authenticated;
grant execute on function public.admin_set_fare_active(uuid, boolean)
  to authenticated;

-- Pembatalan oleh admin untuk pesanan yang belum selesai.
create or replace function public.admin_cancel_order(
  p_order_id uuid,
  p_reason text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  if not public.is_admin() then
    raise exception 'Akses admin diperlukan.';
  end if;

  select *
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Pesanan tidak ditemukan.';
  end if;

  if v_order.status not in ('pending', 'accepted', 'in_progress') then
    raise exception 'Pesanan ini tidak bisa dibatalkan.';
  end if;

  update public.orders
  set status = 'cancelled',
      cancelled_at = now(),
      cancellation_reason = coalesce(
        nullif(btrim(p_reason), ''),
        'Dibatalkan admin.'
      )
  where id = p_order_id
  returning * into v_order;

  if v_order.driver_id is not null then
    update public.drivers
    set status = 'available'
    where id = v_order.driver_id;
  end if;

  return v_order;
end;
$$;

revoke all on function public.admin_cancel_order(uuid, text)
  from public, anon, authenticated;
grant execute on function public.admin_cancel_order(uuid, text)
  to authenticated;

-- Catat atau perbarui pembayaran. Nominal selalu dari total pesanan.
create or replace function public.admin_record_payment(
  p_order_id uuid,
  p_method text,
  p_status text default 'paid',
  p_reference text default null
)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_payment public.payments;
  v_reference text := nullif(btrim(p_reference), '');
begin
  if not public.is_admin() then
    raise exception 'Akses admin diperlukan.';
  end if;

  if p_method not in ('cash', 'qris') then
    raise exception 'Metode pembayaran tidak valid.';
  end if;

  if p_status not in ('pending', 'paid', 'failed', 'refunded') then
    raise exception 'Status pembayaran tidak valid.';
  end if;

  select *
  into v_order
  from public.orders
  where id = p_order_id;

  if not found then
    raise exception 'Pesanan tidak ditemukan.';
  end if;

  if v_order.status = 'cancelled' then
    raise exception 'Pesanan dibatalkan, pembayaran tidak bisa dicatat.';
  end if;

  insert into public.payments (
    order_id, method, status, amount, reference, paid_at
  )
  values (
    p_order_id,
    p_method,
    p_status,
    v_order.total_amount,
    v_reference,
    case when p_status = 'paid' then now() else null end
  )
  on conflict (order_id) do update
  set method = excluded.method,
      status = excluded.status,
      amount = excluded.amount,
      reference = coalesce(excluded.reference, public.payments.reference),
      paid_at = case
        when excluded.status = 'paid'
          then coalesce(public.payments.paid_at, now())
        else null
      end
  returning * into v_payment;

  return v_payment;
end;
$$;

revoke all on function public.admin_record_payment(uuid, text, text, text)
  from public, anon, authenticated;
grant execute on function public.admin_record_payment(uuid, text, text, text)
  to authenticated;

create or replace function public.admin_set_payment_status(
  p_payment_id uuid,
  p_status text
)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.payments;
begin
  if not public.is_admin() then
    raise exception 'Akses admin diperlukan.';
  end if;

  if p_status not in ('pending', 'paid', 'failed', 'refunded') then
    raise exception 'Status pembayaran tidak valid.';
  end if;

  update public.payments
  set status = p_status,
      paid_at = case
        when p_status = 'paid' then coalesce(paid_at, now())
        else null
      end
  where id = p_payment_id
  returning * into v_payment;

  if v_payment.id is null then
    raise exception 'Pembayaran tidak ditemukan.';
  end if;

  return v_payment;
end;
$$;

revoke all on function public.admin_set_payment_status(uuid, text)
  from public, anon, authenticated;
grant execute on function public.admin_set_payment_status(uuid, text)
  to authenticated;
