-- Tabel inti Godiand: tempat, driver, merchant, menu, tarif, pesanan,
-- pembayaran, SOS, chat, dan rating.
-- Aman dijalankan ulang; tidak menghapus data lama.
-- Jalankan setelah 20261119000000_users_email_auth.sql.

alter table public.users
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null default 'lainnya'
    check (category in ('landmark', 'kampus', 'pasar', 'pelabuhan', 'bandara', 'terminal', 'kota', 'lainnya')),
  address text,
  latitude numeric(9, 6) not null check (latitude between -90 and 90),
  longitude numeric(9, 6) not null check (longitude between -180 and 180),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists places_active_category_idx
  on public.places (category)
  where is_active;

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  vehicle_type text not null default 'motor'
    check (vehicle_type in ('motor', 'mobil')),
  vehicle_plate text,
  status text not null default 'offline'
    check (status in ('offline', 'available', 'busy')),
  is_verified boolean not null default false,
  verified_at timestamptz,
  last_place_id uuid references public.places (id) on delete set null,
  last_latitude numeric(9, 6) check (last_latitude between -90 and 90),
  last_longitude numeric(9, 6) check (last_longitude between -180 and 180),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint drivers_last_location_pair check (
    (last_latitude is null) = (last_longitude is null)
  )
);

create index if not exists drivers_status_idx
  on public.drivers (status)
  where is_verified;

create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.users (id) on delete set null,
  place_id uuid references public.places (id) on delete set null,
  name text not null,
  slug text not null unique,
  category text not null
    check (category in ('makanan', 'mart', 'laundry')),
  description text,
  phone text,
  address text,
  latitude numeric(9, 6) check (latitude between -90 and 90),
  longitude numeric(9, 6) check (longitude between -180 and 180),
  is_active boolean not null default true,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint merchants_location_pair check (
    (latitude is null) = (longitude is null)
  )
);

create index if not exists merchants_active_category_idx
  on public.merchants (category)
  where is_active;

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  name text not null,
  description text,
  price integer not null check (price >= 0),
  category text,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_items_merchant_idx
  on public.menu_items (merchant_id)
  where is_available;

create table if not exists public.fares (
  id uuid primary key default gen_random_uuid(),
  service_type text not null
    check (service_type in ('ride', 'send', 'food', 'laundry', 'titip', 'mart')),
  base_fare integer not null check (base_fare >= 0),
  per_km integer not null check (per_km >= 0),
  minimum_fare integer not null check (minimum_fare >= 0),
  max_distance_km numeric(6, 2) not null default 30
    check (max_distance_km > 0),
  is_active boolean not null default true,
  effective_from date not null default current_date,
  created_at timestamptz not null default now(),
  unique (service_type, effective_from)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.users (id) on delete restrict,
  driver_id uuid references public.drivers (id) on delete set null,
  merchant_id uuid references public.merchants (id) on delete set null,
  service_type text not null
    check (service_type in ('ride', 'send', 'food', 'laundry', 'titip', 'mart')),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  pickup_place_id uuid references public.places (id) on delete set null,
  dropoff_place_id uuid references public.places (id) on delete set null,
  pickup_address text,
  dropoff_address text,
  distance_km numeric(6, 2) not null default 0 check (distance_km >= 0),
  delivery_fee integer not null default 0 check (delivery_fee >= 0),
  items_total integer not null default 0 check (items_total >= 0),
  total_amount integer generated always as (items_total + delivery_fee) stored,
  notes text,
  scheduled_at timestamptz,
  accepted_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_merchant_by_service check (
    (service_type in ('ride', 'send') and merchant_id is null)
    or (service_type = 'titip')
    or (service_type in ('food', 'laundry', 'mart') and merchant_id is not null)
  )
);

create index if not exists orders_customer_created_idx
  on public.orders (customer_id, created_at desc);

create index if not exists orders_driver_created_idx
  on public.orders (driver_id, created_at desc)
  where driver_id is not null;

create index if not exists orders_merchant_created_idx
  on public.orders (merchant_id, created_at desc)
  where merchant_id is not null;

create index if not exists orders_status_idx
  on public.orders (status, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  menu_item_id uuid references public.menu_items (id) on delete set null,
  name text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null default 1 check (quantity > 0),
  line_total integer generated always as (unit_price * quantity) stored,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_idx
  on public.order_items (order_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  method text not null check (method in ('cash', 'qris')),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded')),
  amount integer not null check (amount >= 0),
  reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_status_idx
  on public.payments (status);

create table if not exists public.sos_reports (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete set null,
  reported_by uuid references public.users (id) on delete set null,
  category text not null default 'lainnya'
    check (category in ('darurat', 'kecelakaan', 'pelecehan', 'lainnya')),
  message text,
  latitude numeric(9, 6) check (latitude between -90 and 90),
  longitude numeric(9, 6) check (longitude between -180 and 180),
  status text not null default 'open'
    check (status in ('open', 'acknowledged', 'resolved')),
  handled_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint sos_location_pair check (
    (latitude is null) = (longitude is null)
  )
);

create index if not exists sos_reports_status_idx
  on public.sos_reports (status, created_at desc);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  sender_id uuid references public.users (id) on delete set null,
  sender_role text not null
    check (sender_role in ('customer', 'driver', 'system')),
  message text not null
    check (btrim(message) <> '' and char_length(message) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_order_idx
  on public.chat_messages (order_id, created_at);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  rater_id uuid not null references public.users (id) on delete cascade,
  driver_id uuid not null references public.drivers (id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists ratings_driver_idx
  on public.ratings (driver_id, created_at desc);
