-- Data awal: tempat di Banda Aceh dan tarif layanan.
-- Koordinat masih perkiraan; sesuaikan lewat dashboard kalau perlu.
-- Tarif awal wajib dicek pemilik usaha sebelum rilis.
-- Aman dijalankan ulang; data yang sudah ada tidak ditimpa.
-- Jalankan setelah 20261119000200_marketplace_rls.sql.

insert into public.places (name, slug, category, address, latitude, longitude)
values
  (
    'Masjid Raya Baiturrahman',
    'masjid-raya-baiturrahman',
    'landmark',
    'Jl. Teuku Umar, Banda Aceh',
    5.5536, 95.3174
  ),
  (
    'Museum Tsunami Aceh',
    'museum-tsunami-aceh',
    'landmark',
    'Jl. Sultan Iskandar Muda, Banda Aceh',
    5.5486, 95.3149
  ),
  (
    'PLTD Apung 1',
    'pltd-apung',
    'landmark',
    'Punge Blang Cut, Jaya Baru, Banda Aceh',
    5.5492, 95.3368
  ),
  (
    'Pantai Ulee Lheue',
    'pantai-ulee-lheue',
    'lainnya',
    'Ulee Lheue, Meuraxa, Banda Aceh',
    5.5618, 95.2938
  ),
  (
    'Universitas Syiah Kuala',
    'universitas-syiah-kuala',
    'kampus',
    'Kopelma Darussalam, Banda Aceh',
    5.5685, 95.3697
  ),
  (
    'Pasar Aceh',
    'pasar-aceh',
    'pasar',
    'Jl. Cut Nyak Dhien, Banda Aceh',
    5.5531, 95.3226
  ),
  (
    'Bandara Sultan Iskandar Muda',
    'bandara-sultan-iskandar-muda',
    'bandara',
    'Blang Bintang, Aceh Besar',
    5.5236, 95.4204
  ),
  (
    'Terminal Batoh',
    'terminal-batoh',
    'terminal',
    'Jl. Mr. Teuku Muhammad Hasan, Banda Aceh',
    5.5367, 95.3270
  )
on conflict (slug) do nothing;

insert into public.fares (
  service_type, base_fare, per_km, minimum_fare, max_distance_km, effective_from
)
values
  ('ride', 5000, 2000, 9000, 30, date '2026-11-01'),
  ('send', 7000, 1500, 9000, 30, date '2026-11-01'),
  ('food', 5000, 2000, 9000, 15, date '2026-11-01'),
  ('laundry', 8000, 1500, 10000, 15, date '2026-11-01'),
  ('titip', 8000, 2000, 12000, 15, date '2026-11-01'),
  ('mart', 6000, 2000, 10000, 15, date '2026-11-01')
on conflict (service_type, effective_from) do nothing;
