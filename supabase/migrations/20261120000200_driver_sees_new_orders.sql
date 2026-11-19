-- Driver terverifikasi boleh melihat pesanan pelanggan yang masih mencari
-- driver (status "mencari_driver") selain pesanan lama berstatus "pending".
-- Aman dijalankan ulang.
-- Jalankan setelah 20261120000100_customer_ride_orders.sql.

drop policy if exists "orders_select_available_driver" on public.orders;

create policy "orders_select_available_driver"
  on public.orders
  for select
  to authenticated
  using (
    status in ('mencari_driver', 'pending')
    and driver_id is null
    and public.is_verified_driver()
  );

drop index if exists public.orders_available_idx;

create index orders_available_idx
  on public.orders (created_at desc)
  where status in ('mencari_driver', 'pending') and driver_id is null;
