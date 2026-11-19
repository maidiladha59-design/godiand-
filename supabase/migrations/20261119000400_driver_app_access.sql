-- Dukungan aplikasi driver (Tahap 5).
-- Driver terverifikasi boleh melihat pesanan pending yang belum diambil,
-- supaya bisa memilih pekerjaan. Rincian item menu tetap tertutup sampai
-- driver menerima pesanan, mengikuti policy order_items yang sudah ada.
-- Aman dijalankan ulang.

create index if not exists orders_available_idx
  on public.orders (created_at desc)
  where status = 'pending' and driver_id is null;

-- Satu driver hanya boleh memegang satu pesanan aktif.
create unique index if not exists orders_one_active_per_driver_idx
  on public.orders (driver_id)
  where status in ('accepted', 'in_progress');

create or replace function public.is_verified_driver()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.drivers d
    where d.user_id = auth.uid()
      and d.is_verified
  );
$$;

revoke all on function public.is_verified_driver() from public, anon, authenticated;
grant execute on function public.is_verified_driver() to authenticated;

drop policy if exists "orders_select_available_driver" on public.orders;
create policy "orders_select_available_driver"
  on public.orders
  for select
  to authenticated
  using (
    status = 'pending'
    and driver_id is null
    and public.is_verified_driver()
  );
