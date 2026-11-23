-- GoDiandRide langkah 1: tarif di server, RPC berbahasa Indonesia,
-- koordinat tempat terverifikasi, dan realtime pesanan.
-- Aman dijalankan ulang; data lama tidak dihapus.
-- Jalankan setelah 20261120000200_driver_sees_new_orders.sql.

-- 1. Tarif per layanan.
-- Kolom lama (base_fare, per_km, minimum_fare, is_active) tetap dipakai
-- aplikasi lain. Kolom Indonesia di bawah ini adalah alias baca-saja agar
-- dashboard/admin yang masih menulis kolom lama tetap sinkron.
alter table public.fares
  add column if not exists jarak_dasar_km numeric(6, 2),
  add column if not exists tarif_dasar integer
    generated always as (base_fare) stored,
  add column if not exists tarif_per_km integer
    generated always as (per_km) stored,
  add column if not exists tarif_minimum integer
    generated always as (minimum_fare) stored,
  add column if not exists aktif boolean
    generated always as (is_active) stored;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.fares'::regclass
      and conname = 'fares_jarak_dasar_km_check'
  ) then
    alter table public.fares
      add constraint fares_jarak_dasar_km_check
      check (jarak_dasar_km is null or jarak_dasar_km >= 0);
  end if;
end
$$;

update public.fares
set jarak_dasar_km = case when service_type = 'ride' then 2 else 0 end
where jarak_dasar_km is null;

-- Baris tarif baru dari admin tidak mengisi jarak_dasar_km. Ride memakai
-- 2 km pertama masuk tarif dasar; layanan lain tetap dihitung per km.
create or replace function public.set_fare_distance_base()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.jarak_dasar_km is null then
    new.jarak_dasar_km := case when new.service_type = 'ride' then 2 else 0 end;
  end if;

  return new;
end;
$$;

drop trigger if exists fares_set_distance_base on public.fares;
create trigger fares_set_distance_base
  before insert or update on public.fares
  for each row execute function public.set_fare_distance_base();

revoke all on function public.set_fare_distance_base()
  from public, anon, authenticated;

-- Tarif awal GoDiandRide: Rp9.000 untuk 2 km pertama, Rp3.000/km berikutnya,
-- minimum Rp9.000. Bisa diubah admin lewat menu Tarif.
insert into public.fares (
  service_type, base_fare, per_km, minimum_fare,
  max_distance_km, effective_from, is_active, jarak_dasar_km
)
values ('ride', 9000, 3000, 9000, 30, date '2026-11-23', true, 2)
on conflict (service_type, effective_from) do nothing;

-- 2. Hitung tarif di server, dibulatkan ke atas per Rp500.
create or replace function public.hitung_tarif(
  p_layanan text,
  p_jarak_km numeric
)
returns integer
language plpgsql
stable
set search_path = public
as $$
declare
  v_fare public.fares%rowtype;
  v_raw numeric;
begin
  if p_layanan is null
    or p_layanan not in ('ride', 'send', 'food', 'laundry', 'titip', 'mart') then
    raise exception 'Layanan tidak dikenal.';
  end if;

  if p_jarak_km is null or p_jarak_km < 0 then
    raise exception 'Jarak tidak valid.';
  end if;

  select *
  into v_fare
  from public.fares f
  where f.service_type = p_layanan
    and f.is_active
    and f.effective_from <= current_date
  order by f.effective_from desc
  limit 1;

  if not found then
    raise exception 'Tarif untuk layanan ini belum tersedia.';
  end if;

  if p_jarak_km > v_fare.max_distance_km then
    raise exception 'Jarak terlalu jauh. Maksimal % km ya.',
      round(v_fare.max_distance_km, 1);
  end if;

  v_raw := v_fare.base_fare
    + greatest(p_jarak_km - coalesce(v_fare.jarak_dasar_km, 0), 0)
      * v_fare.per_km;

  return greatest(
    v_fare.minimum_fare,
    (ceil(v_raw / 500.0) * 500)::integer
  );
end;
$$;

revoke all on function public.hitung_tarif(text, numeric)
  from public, anon, authenticated;
grant execute on function public.hitung_tarif(text, numeric)
  to anon, authenticated;

-- Rumus lama ikut memakai jarak_dasar_km agar tarif yang dipakai trigger
-- pesanan dan aplikasi lain selalu sama.
create or replace function public.calculate_fare(
  p_service_type text,
  p_distance_km numeric
)
returns integer
language plpgsql
stable
set search_path = public
as $$
declare
  v_fare public.fares%rowtype;
  v_raw numeric;
begin
  if p_service_type is null
    or p_service_type not in ('ride', 'send', 'food', 'laundry', 'titip', 'mart') then
    raise exception 'Layanan tidak dikenal.';
  end if;

  if p_distance_km is null or p_distance_km < 0 then
    raise exception 'Jarak tidak valid.';
  end if;

  select *
  into v_fare
  from public.fares f
  where f.service_type = p_service_type
    and f.is_active
    and f.effective_from <= current_date
  order by f.effective_from desc
  limit 1;

  if not found then
    raise exception 'Tarif untuk layanan ini belum tersedia.';
  end if;

  if p_distance_km > v_fare.max_distance_km then
    raise exception 'Jarak melebihi batas layanan (%).',
      round(v_fare.max_distance_km, 1);
  end if;

  v_raw := v_fare.base_fare
    + greatest(p_distance_km - coalesce(v_fare.jarak_dasar_km, 0), 0)
      * v_fare.per_km;

  return greatest(
    v_fare.minimum_fare,
    (ceil(v_raw / 500.0) * 500)::integer
  );
end;
$$;

-- 3. Buat pesanan. Jarak dan tarif dihitung ulang di server dari koordinat;
-- jarak dari HP hanya untuk tampilan estimasi.
-- Jarak = haversine x 1,3 (faktor jalan), sama dengan perhitungan di app.
-- Nanti bisa diganti layanan rute sungguhan tanpa mengubah kontrak RPC.
create or replace function public.buat_pesanan(
  p_layanan text,
  p_jemput_nama text,
  p_jemput_lat numeric,
  p_jemput_lng numeric,
  p_tujuan_nama text,
  p_tujuan_lat numeric,
  p_tujuan_lng numeric,
  p_metode_bayar text,
  p_jemput_place_id uuid default null,
  p_tujuan_place_id uuid default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid := auth.uid();
  v_method text;
  v_distance numeric;
  v_tarif integer;
  v_h numeric;
  v_order public.orders;
begin
  if v_customer_id is null then
    raise exception 'Kamu harus masuk dulu.';
  end if;

  if p_layanan is null
    or p_layanan not in ('ride', 'send', 'titip') then
    raise exception 'Layanan ini belum bisa dipesan dari aplikasi.';
  end if;

  v_method := case lower(coalesce(p_metode_bayar, ''))
    when 'tunai' then 'cash'
    when 'cash' then 'cash'
    when 'qris' then 'qris'
    else null
  end;

  if v_method is null then
    raise exception 'Metode bayar cuma Tunai atau QRIS ya.';
  end if;

  if coalesce(btrim(p_jemput_nama), '') = ''
    or coalesce(btrim(p_tujuan_nama), '') = '' then
    raise exception 'Titik jemput dan tujuan wajib diisi.';
  end if;

  if p_jemput_lat is null
    or p_jemput_lng is null
    or p_tujuan_lat is null
    or p_tujuan_lng is null then
    raise exception 'Titik lokasi belum lengkap.';
  end if;

  if abs(p_jemput_lat) > 90
    or abs(p_jemput_lng) > 180
    or abs(p_tujuan_lat) > 90
    or abs(p_tujuan_lng) > 180 then
    raise exception 'Titik lokasi di luar jangkauan.';
  end if;

  v_h := power(sin(radians(p_tujuan_lat - p_jemput_lat) / 2), 2)
    + cos(radians(p_jemput_lat)) * cos(radians(p_tujuan_lat))
      * power(sin(radians(p_tujuan_lng - p_jemput_lng) / 2), 2);
  v_distance := round(
    (2 * 6371 * asin(least(1, sqrt(v_h))) * 1.3)::numeric,
    1
  );

  if v_distance < 0.1 then
    v_distance := 0.1;
  end if;

  v_tarif := public.hitung_tarif(p_layanan, v_distance);

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
    p_layanan,
    case when p_layanan = 'ride' then 'mencari_driver' else 'pending' end,
    p_jemput_place_id,
    p_tujuan_place_id,
    btrim(p_jemput_nama),
    btrim(p_tujuan_nama),
    v_distance,
    p_jemput_lat,
    p_jemput_lng,
    p_tujuan_lat,
    p_tujuan_lng
  )
  returning * into v_order;

  if v_order.total_amount <> v_tarif then
    raise exception 'Tarif berubah saat pesanan dibuat. Coba lagi ya.';
  end if;

  insert into public.payments (order_id, method, amount)
  values (v_order.id, v_method, v_order.total_amount);

  return v_order;
end;
$$;

revoke all on function public.buat_pesanan(
  text, text, numeric, numeric, text, numeric, numeric, text, uuid, uuid
) from public, anon, authenticated;
grant execute on function public.buat_pesanan(
  text, text, numeric, numeric, text, numeric, numeric, text, uuid, uuid
) to authenticated;

-- 4. Koordinat terverifikasi.
-- Sumber: OpenStreetMap via Nominatim, diakses 23 November 2026.
-- Data (c) OpenStreetMap contributors, ODbL 1.0 (osm.org/copyright).
insert into public.places (name, slug, category, address, latitude, longitude)
values
  (
    'Masjid Raya Baiturrahman',
    'masjid-raya-baiturrahman',
    'landmark',
    'Jl. Teuku Umar, Banda Aceh',
    5.553631, 95.317193
  ),
  (
    'Museum Tsunami Aceh',
    'museum-tsunami-aceh',
    'landmark',
    'Jl. Sultan Iskandar Muda, Banda Aceh',
    5.547820, 95.315165
  ),
  (
    'PLTD Apung 1',
    'pltd-apung',
    'landmark',
    'Punge Blang Cut, Jaya Baru, Banda Aceh',
    5.546419, 95.306790
  ),
  (
    'Pantai Ulee Lheue',
    'pantai-ulee-lheue',
    'lainnya',
    'Ulee Lheue, Meuraxa, Banda Aceh',
    5.559854, 95.285432
  )
on conflict (slug) do nothing;

update public.places
set latitude = 5.553631, longitude = 95.317193
where slug = 'masjid-raya-baiturrahman'
  and latitude = 5.5536
  and longitude = 95.3174;

update public.places
set latitude = 5.547820, longitude = 95.315165
where slug = 'museum-tsunami-aceh'
  and latitude = 5.5486
  and longitude = 95.3149;

update public.places
set latitude = 5.546419, longitude = 95.306790
where slug = 'pltd-apung'
  and latitude = 5.5492
  and longitude = 95.3368;

update public.places
set latitude = 5.559854, longitude = 95.285432
where slug = 'pantai-ulee-lheue'
  and latitude = 5.5618
  and longitude = 95.2938;

-- 5. Realtime untuk status pesanan. RLS tetap membatasi data yang dikirim.
do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end
$$;

alter table public.orders replica identity full;

-- Catatan RLS yang sudah berlaku (tidak diubah di sini):
-- - orders: pelanggan hanya membaca pesanannya sendiri.
-- - orders: tidak ada grant UPDATE, jadi status hanya bisa lewat RPC
--   cancel_order (menjadi 'cancelled').
-- - fares: pelanggan hanya bisa membaca tarif aktif, tidak bisa mengubah.
