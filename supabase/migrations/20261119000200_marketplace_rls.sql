-- Fungsi server, trigger, dan RLS untuk tabel marketplace Godiand.
-- Aman dijalankan ulang.
-- Jalankan setelah 20261119000100_marketplace_tables.sql.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists places_set_updated_at on public.places;
create trigger places_set_updated_at
  before update on public.places
  for each row execute function public.set_updated_at();

drop trigger if exists drivers_set_updated_at on public.drivers;
create trigger drivers_set_updated_at
  before update on public.drivers
  for each row execute function public.set_updated_at();

drop trigger if exists merchants_set_updated_at on public.merchants;
create trigger merchants_set_updated_at
  before update on public.merchants
  for each row execute function public.set_updated_at();

drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

drop trigger if exists sos_reports_set_updated_at on public.sos_reports;
create trigger sos_reports_set_updated_at
  before update on public.sos_reports
  for each row execute function public.set_updated_at();

-- Dipakai policy drivers. Security definer agar tidak terjadi rekursi RLS
-- drivers -> orders -> drivers.
create or replace function public.customer_has_driver_order(p_driver_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    where o.driver_id = p_driver_id
      and o.customer_id = auth.uid()
  );
$$;

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
    raise exception 'Jarak melebihi batas layanan (%).', v_fare.max_distance_km;
  end if;

  v_raw := v_fare.base_fare + (p_distance_km * v_fare.per_km);

  return greatest(
    v_fare.minimum_fare,
    (ceil(v_raw / 500.0) * 500)::integer
  );
end;
$$;

create or replace function public.set_order_delivery_fee()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.delivery_fee := public.calculate_fare(new.service_type, new.distance_km);
  return new;
end;
$$;

drop trigger if exists orders_set_delivery_fee on public.orders;
create trigger orders_set_delivery_fee
  before insert or update of service_type, distance_km on public.orders
  for each row execute function public.set_order_delivery_fee();

create or replace function public.set_order_item_price()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_price integer;
  v_available boolean;
  v_merchant_id uuid;
  v_order_merchant_id uuid;
  v_order_status text;
begin
  if new.menu_item_id is null then
    if tg_op = 'INSERT' then
      raise exception 'Pilih menu dari merchant.';
    end if;
    -- Menu dihapus dari katalog: nama dan harga lama tetap dipakai.
    return new;
  end if;

  select mi.name, mi.price, mi.is_available, mi.merchant_id
  into v_name, v_price, v_available, v_merchant_id
  from public.menu_items mi
  where mi.id = new.menu_item_id;

  if not found then
    raise exception 'Menu tidak ditemukan.';
  end if;

  if not v_available then
    raise exception 'Menu sedang tidak tersedia.';
  end if;

  select o.merchant_id, o.status
  into v_order_merchant_id, v_order_status
  from public.orders o
  where o.id = new.order_id;

  if not found then
    raise exception 'Pesanan tidak ditemukan.';
  end if;

  if v_order_status <> 'pending' then
    raise exception 'Pesanan sudah diproses.';
  end if;

  if v_order_merchant_id is distinct from v_merchant_id then
    raise exception 'Menu bukan dari merchant pesanan ini.';
  end if;

  new.name := v_name;
  new.unit_price := v_price;
  return new;
end;
$$;

drop trigger if exists order_items_set_price on public.order_items;
create trigger order_items_set_price
  before insert or update of menu_item_id on public.order_items
  for each row execute function public.set_order_item_price();

create or replace function public.sync_order_items_total()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_ids uuid[] := array[]::uuid[];
begin
  if tg_op in ('UPDATE', 'DELETE') then
    v_order_ids := array_append(v_order_ids, old.order_id);
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    v_order_ids := array_append(v_order_ids, new.order_id);
  end if;

  update public.orders o
  set items_total = coalesce(
    (
      select sum(oi.unit_price * oi.quantity)::integer
      from public.order_items oi
      where oi.order_id = o.id
    ),
    0
  )
  where o.id = any(v_order_ids);

  return null;
end;
$$;

drop trigger if exists order_items_sync_total on public.order_items;
create trigger order_items_sync_total
  after insert or update or delete on public.order_items
  for each row execute function public.sync_order_items_total();

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
    and status = 'pending'
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

create or replace function public.update_order_status(
  p_order_id uuid,
  p_status text
)
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

  if p_status = 'in_progress' then
    update public.orders
    set status = 'in_progress'
    where id = p_order_id
      and driver_id = v_driver_id
      and status = 'accepted'
    returning * into v_order;
  elsif p_status = 'completed' then
    update public.orders
    set status = 'completed',
        completed_at = now()
    where id = p_order_id
      and driver_id = v_driver_id
      and status = 'in_progress'
    returning * into v_order;
  else
    raise exception 'Status tidak valid.';
  end if;

  if v_order.id is null then
    raise exception 'Status pesanan tidak bisa diubah.';
  end if;

  if p_status = 'completed' then
    update public.drivers
    set status = 'available'
    where id = v_driver_id;
  end if;

  return v_order;
end;
$$;

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

  if v_order.status not in ('pending', 'accepted') then
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

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.customer_has_driver_order(uuid) from public, anon, authenticated;
revoke all on function public.calculate_fare(text, numeric) from public, anon, authenticated;
revoke all on function public.set_order_delivery_fee() from public, anon, authenticated;
revoke all on function public.set_order_item_price() from public, anon, authenticated;
revoke all on function public.sync_order_items_total() from public, anon, authenticated;
revoke all on function public.accept_order(uuid) from public, anon, authenticated;
revoke all on function public.update_order_status(uuid, text) from public, anon, authenticated;
revoke all on function public.cancel_order(uuid, text) from public, anon, authenticated;

grant execute on function public.customer_has_driver_order(uuid) to authenticated;
grant execute on function public.calculate_fare(text, numeric) to anon, authenticated;
grant execute on function public.accept_order(uuid) to authenticated;
grant execute on function public.update_order_status(uuid, text) to authenticated;
grant execute on function public.cancel_order(uuid, text) to authenticated;

alter table public.places enable row level security;
alter table public.drivers enable row level security;
alter table public.merchants enable row level security;
alter table public.menu_items enable row level security;
alter table public.fares enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.sos_reports enable row level security;
alter table public.chat_messages enable row level security;
alter table public.ratings enable row level security;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'places', 'drivers', 'merchants', 'menu_items', 'fares',
        'orders', 'order_items', 'payments', 'sos_reports',
        'chat_messages', 'ratings'
      )
  loop
    execute format(
      'drop policy %I on %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  end loop;
end
$$;

create policy "places_select_active"
  on public.places
  for select
  to anon, authenticated
  using (is_active);

create policy "fares_select_active"
  on public.fares
  for select
  to anon, authenticated
  using (is_active);

create policy "merchants_select_active"
  on public.merchants
  for select
  to anon, authenticated
  using (is_active);

create policy "merchants_select_owner"
  on public.merchants
  for select
  to authenticated
  using (owner_user_id = (select auth.uid()));

create policy "menu_items_select_available"
  on public.menu_items
  for select
  to anon, authenticated
  using (
    is_available
    and exists (
      select 1
      from public.merchants m
      where m.id = merchant_id
        and m.is_active
    )
  );

create policy "menu_items_select_owner"
  on public.menu_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.merchants m
      where m.id = merchant_id
        and m.owner_user_id = (select auth.uid())
    )
  );

create policy "drivers_select_related"
  on public.drivers
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or public.customer_has_driver_order(id)
  );

create policy "drivers_insert_own"
  on public.drivers
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and is_verified = false
  );

create policy "drivers_update_own"
  on public.drivers
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "orders_select_related"
  on public.orders
  for select
  to authenticated
  using (
    customer_id = (select auth.uid())
    or exists (
      select 1
      from public.drivers d
      where d.id = driver_id
        and d.user_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.merchants m
      where m.id = merchant_id
        and m.owner_user_id = (select auth.uid())
    )
  );

create policy "orders_insert_own_pending"
  on public.orders
  for insert
  to authenticated
  with check (
    customer_id = (select auth.uid())
    and status = 'pending'
    and driver_id is null
    and (
      merchant_id is null
      or exists (
        select 1
        from public.merchants m
        where m.id = merchant_id
          and m.is_active
      )
    )
  );

create policy "order_items_select_related"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and (
          o.customer_id = (select auth.uid())
          or exists (
            select 1
            from public.drivers d
            where d.id = o.driver_id
              and d.user_id = (select auth.uid())
          )
          or exists (
            select 1
            from public.merchants m
            where m.id = o.merchant_id
              and m.owner_user_id = (select auth.uid())
          )
        )
    )
  );

create policy "order_items_insert_own_pending"
  on public.order_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and o.customer_id = (select auth.uid())
        and o.status = 'pending'
    )
  );

create policy "order_items_update_own_pending"
  on public.order_items
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and o.customer_id = (select auth.uid())
        and o.status = 'pending'
    )
  )
  with check (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and o.customer_id = (select auth.uid())
        and o.status = 'pending'
    )
  );

create policy "order_items_delete_own_pending"
  on public.order_items
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and o.customer_id = (select auth.uid())
        and o.status = 'pending'
    )
  );

create policy "payments_select_related"
  on public.payments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and (
          o.customer_id = (select auth.uid())
          or exists (
            select 1
            from public.drivers d
            where d.id = o.driver_id
              and d.user_id = (select auth.uid())
          )
        )
    )
  );

create policy "sos_reports_select_own"
  on public.sos_reports
  for select
  to authenticated
  using (reported_by = (select auth.uid()));

create policy "sos_reports_insert_own"
  on public.sos_reports
  for insert
  to authenticated
  with check (
    reported_by = (select auth.uid())
    and (
      order_id is null
      or exists (
        select 1
        from public.orders o
        where o.id = order_id
          and (
            o.customer_id = (select auth.uid())
            or exists (
              select 1
              from public.drivers d
              where d.id = o.driver_id
                and d.user_id = (select auth.uid())
            )
          )
      )
    )
  );

create policy "chat_messages_select_participants"
  on public.chat_messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and (
          o.customer_id = (select auth.uid())
          or exists (
            select 1
            from public.drivers d
            where d.id = o.driver_id
              and d.user_id = (select auth.uid())
          )
        )
    )
  );

create policy "chat_messages_insert_participants"
  on public.chat_messages
  for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1
      from public.orders o
      where o.id = order_id
        and (
          (
            sender_role = 'customer'
            and o.customer_id = (select auth.uid())
          )
          or (
            sender_role = 'driver'
            and exists (
              select 1
              from public.drivers d
              where d.id = o.driver_id
                and d.user_id = (select auth.uid())
            )
          )
        )
    )
  );

create policy "ratings_select_related"
  on public.ratings
  for select
  to authenticated
  using (
    rater_id = (select auth.uid())
    or exists (
      select 1
      from public.drivers d
      where d.id = driver_id
        and d.user_id = (select auth.uid())
    )
  );

create policy "ratings_insert_own_completed"
  on public.ratings
  for insert
  to authenticated
  with check (
    rater_id = (select auth.uid())
    and exists (
      select 1
      from public.orders o
      where o.id = order_id
        and o.customer_id = (select auth.uid())
        and o.status = 'completed'
        and o.driver_id = driver_id
    )
  );

revoke all on table public.places from anon, authenticated;
revoke all on table public.fares from anon, authenticated;
revoke all on table public.merchants from anon, authenticated;
revoke all on table public.menu_items from anon, authenticated;
revoke all on table public.drivers from anon, authenticated;
revoke all on table public.orders from anon, authenticated;
revoke all on table public.order_items from anon, authenticated;
revoke all on table public.payments from anon, authenticated;
revoke all on table public.sos_reports from anon, authenticated;
revoke all on table public.chat_messages from anon, authenticated;
revoke all on table public.ratings from anon, authenticated;

grant select on table public.places to anon, authenticated;
grant select on table public.fares to anon, authenticated;
grant select on table public.merchants to anon, authenticated;
grant select on table public.menu_items to anon, authenticated;

grant select on table public.drivers to authenticated;
grant insert (
  user_id, vehicle_type, vehicle_plate, status,
  last_place_id, last_latitude, last_longitude, last_seen_at
) on table public.drivers to authenticated;
grant update (
  vehicle_type, vehicle_plate, status,
  last_place_id, last_latitude, last_longitude, last_seen_at
) on table public.drivers to authenticated;

grant select on table public.orders to authenticated;
grant insert (
  customer_id, merchant_id, service_type,
  pickup_place_id, dropoff_place_id, pickup_address, dropoff_address,
  distance_km, notes, scheduled_at
) on table public.orders to authenticated;

grant select on table public.order_items to authenticated;
grant insert (order_id, menu_item_id, quantity, notes)
  on table public.order_items to authenticated;
grant update (quantity, notes) on table public.order_items to authenticated;
grant delete on table public.order_items to authenticated;

grant select on table public.payments to authenticated;
grant select on table public.sos_reports to authenticated;
grant insert (order_id, reported_by, category, message, latitude, longitude)
  on table public.sos_reports to authenticated;
grant select on table public.chat_messages to authenticated;
grant insert (order_id, sender_id, sender_role, message)
  on table public.chat_messages to authenticated;
grant select on table public.ratings to authenticated;
grant insert (order_id, rater_id, driver_id, score, comment)
  on table public.ratings to authenticated;
