-- Pesanan GoDiandRide dari aplikasi pelanggan.
-- Menambah status "mencari_driver", koordinat jemput/tujuan, dan fungsi
-- create_ride_order. Aman dijalankan ulang.
-- Jalankan setelah 20261119000200_marketplace_rls.sql.

alter table public.orders
  add column if not exists pickup_latitude numeric(9, 6)
    check (pickup_latitude between -90 and 90),
  add column if not exists pickup_longitude numeric(9, 6)
    check (pickup_longitude between -180 and 180),
  add column if not exists dropoff_latitude numeric(9, 6)
    check (dropoff_latitude between -90 and 90),
  add column if not exists dropoff_longitude numeric(9, 6)
    check (dropoff_longitude between -180 and 180);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.orders'::regclass
      and conname = 'orders_pickup_location_pair'
  ) then
    alter table public.orders
      add constraint orders_pickup_location_pair
      check ((pickup_latitude is null) = (pickup_longitude is null));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.orders'::regclass
      and conname = 'orders_dropoff_location_pair'
  ) then
    alter table public.orders
      add constraint orders_dropoff_location_pair
      check ((dropoff_latitude is null) = (dropoff_longitude is null));
  end if;
end
$$;

do $$
declare
  v_constraint record;
begin
  for v_constraint in
    select con.conname
    from pg_constraint con
    where con.conrelid = 'public.orders'::regclass
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%pending%'
      and pg_get_constraintdef(con.oid) ilike '%cancelled%'
      and pg_get_constraintdef(con.oid) not ilike '%mencari_driver%'
  loop
    execute format(
      'alter table public.orders drop constraint %I',
      v_constraint.conname
    );
  end loop;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.orders'::regclass
      and conname = 'orders_status_check'
  ) then
    alter table public.orders
      add constraint orders_status_check
      check (
        status in (
          'mencari_driver', 'pending', 'accepted',
          'in_progress', 'completed', 'cancelled'
        )
      );
  end if;
end
$$;

-- Driver tetap bisa menerima pesanan lama (pending) dan pesanan baru
-- dari aplikasi pelanggan (mencari_driver).
create or replace function public.accept_order(p_order_id uuid)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_driver_id uuid;
  v_order public.orders;
begin
  select d.id
  into v_driver_id
  from public.drivers d
  where d.user_id = auth.uid()
    and d.is_verified;

  if v_driver_id is null then
    raise exception 'Akun driver belum terverifikasi.';
  end if;

  update public.orders
  set driver_id = v_driver_id,
      status = 'accepted',
      accepted_at = now()
  where id = p_order_id
    and status in ('mencari_driver', 'pending')
    and driver_id is null
  returning * into v_order;

  if v_order.id is null then
    raise exception 'Pesanan sudah diambil atau tidak tersedia.';
  end if;

  update public.drivers
  set status = 'busy'
  where id = v_driver_id;

  return v_order;
end;
$$;

-- Pelanggan boleh membatalkan selama driver belum jalan.
create or replace function public.cancel_order(
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
  v_driver_id uuid;
begin
  select *
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Pesanan tidak ditemukan.';
  end if;

  select d.id
  into v_driver_id
  from public.drivers d
  where d.user_id = auth.uid();

  if v_order.customer_id is distinct from auth.uid()
    and (v_order.driver_id is null or v_order.driver_id is distinct from v_driver_id) then
    raise exception 'Kamu tidak berhak membatalkan pesanan ini.';
  end if;

  if v_order.status not in ('pending', 'mencari_driver', 'accepted') then
    raise exception 'Pesanan sudah berjalan dan tidak bisa dibatalkan.';
  end if;

  update public.orders
  set status = 'cancelled',
      cancelled_at = now(),
      cancellation_reason = nullif(btrim(p_reason), '')
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

-- Satu langkah: hitung tarif di server (trigger), simpan pesanan dengan
-- status mencari_driver, lalu catat metode bayarnya.
create or replace function public.create_ride_order(
  p_pickup_address text,
  p_dropoff_address text,
  p_pickup_latitude numeric,
  p_pickup_longitude numeric,
  p_dropoff_latitude numeric,
  p_dropoff_longitude numeric,
  p_distance_km numeric,
  p_payment_method text,
  p_pickup_place_id uuid default null,
  p_dropoff_place_id uuid default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid := auth.uid();
  v_order public.orders;
begin
  if v_customer_id is null then
    raise exception 'Kamu harus masuk dulu.';
  end if;

  if p_payment_method is null
    or p_payment_method not in ('cash', 'qris') then
    raise exception 'Metode bayar tidak dikenal.';
  end if;

  if coalesce(btrim(p_pickup_address), '') = ''
    or coalesce(btrim(p_dropoff_address), '') = '' then
    raise exception 'Titik jemput dan tujuan wajib diisi.';
  end if;

  if p_pickup_latitude is null
    or p_pickup_longitude is null
    or p_dropoff_latitude is null
    or p_dropoff_longitude is null then
    raise exception 'Titik lokasi belum lengkap.';
  end if;

  if p_distance_km is null or p_distance_km <= 0 then
    raise exception 'Jarak tidak valid.';
  end if;

  if abs(p_pickup_latitude) > 90
    or abs(p_pickup_longitude) > 180
    or abs(p_dropoff_latitude) > 90
    or abs(p_dropoff_longitude) > 180 then
    raise exception 'Titik lokasi di luar jangkauan.';
  end if;

  insert into public.orders (
    customer_id,
    service_type,
    status,
    pickup_place_id,
    dropoff_place_id,
    pickup_address,
    dropoff_address,
    distance_km,
    pickup_latitude,
    pickup_longitude,
    dropoff_latitude,
    dropoff_longitude
  )
  values (
    v_customer_id,
    'ride',
    'mencari_driver',
    p_pickup_place_id,
    p_dropoff_place_id,
    btrim(p_pickup_address),
    btrim(p_dropoff_address),
    p_distance_km,
    p_pickup_latitude,
    p_pickup_longitude,
    p_dropoff_latitude,
    p_dropoff_longitude
  )
  returning * into v_order;

  insert into public.payments (order_id, method, amount)
  values (v_order.id, p_payment_method, v_order.total_amount);

  return v_order;
end;
$$;

revoke all on function public.create_ride_order(
  text, text, numeric, numeric, numeric, numeric, numeric, text, uuid, uuid
) from public, anon, authenticated;

grant execute on function public.create_ride_order(
  text, text, numeric, numeric, numeric, numeric, numeric, text, uuid, uuid
) to authenticated;
