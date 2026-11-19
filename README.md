# Godiand

Aplikasi ojek, antar barang, makanan, laundry, titip beli, dan belanja untuk
Banda Aceh: situs Next.js, aplikasi pelanggan dan driver (Expo), serta panel
admin berbasis web.

Tagline: **Ojek, antar, makan. Semua sat-set di Banda Aceh.**

## Status

- Tahap 1 — Setup Next.js + Tailwind CSS: selesai.
- Tahap 2 — Landing page + halaman pendukung: selesai.
- Tahap 3 — Supabase + auth email OTP + skema database: kode selesai; 4
  migration, Resend, dan pengaturan dashboard perlu disiapkan manual (lihat
  [Auth email](#auth-email-supabase--resend) dan [Database](#4-database)).
- Tahap 4 — Aplikasi pelanggan (Expo): alur inti selesai (pesan, tarif,
  riwayat, detail, chat, SOS, rating, akun). Pembayaran dan peta menyusul.
- Tahap 5 — Aplikasi driver (Expo): alur inti selesai (daftar kendaraan,
  verifikasi admin, status online, cari dan ambil pesanan, rincian, chat, SOS,
  riwayat, rating). Pembayaran dan lokasi langsung menyusul.
- Tahap 6 — Panel admin (Next.js): selesai. Login admin, verifikasi driver dan
  merchant, tarif, pesanan (termasuk pembatalan), SOS, dan pembayaran. Perlu
  akun admin pertama lewat SQL (lihat [Panel admin](#panel-admin-nextjs)) dan
  6 migration yang dijalankan manual di Supabase.

## Stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS 4
- TypeScript strict
- Supabase (Auth email OTP, database, RLS)
- Resend sebagai SMTP kustom Supabase
- Font Plus Jakarta Sans lewat `next/font`

## Menjalankan

```bash
npm install
cp .env.example .env.local   # lalu isi nilainya
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Halaman auth ada di
[http://localhost:3000/masuk](http://localhost:3000/masuk).

Perintah lain:

```bash
npm run lint       # ESLint
npx tsc --noEmit   # cek tipe
npm run build      # build produksi
npm start          # jalankan hasil build
```

## Halaman

| Rute          | Isi                                                        |
| ------------- | ---------------------------------------------------------- |
| `/`           | Landing: hero, ticker, 6 layanan, tempat, cara pesan, mitra |
| `/masuk`      | Masuk/daftar dengan email dan kode 6 digit                 |
| `/unduh`      | Detail unduhan, status APK Android                         |
| `/privasi`    | Kebijakan Privasi                                          |
| `/syarat`     | Syarat Layanan                                             |
| `/hapus-akun` | Panduan penghapusan akun                                   |
| 404           | Halaman tidak ditemukan                                    |

Panel admin (semua `noindex`, tanpa tautan dari situs publik):

| Rute                     | Isi                                          |
| ------------------------ | -------------------------------------------- |
| `/admin/masuk`           | Login admin dengan email OTP                 |
| `/admin`                 | Ringkasan: driver, merchant, pesanan, SOS    |
| `/admin/driver`          | Verifikasi dan cabut verifikasi driver       |
| `/admin/merchant`        | Verifikasi dan cabut verifikasi merchant     |
| `/admin/tarif`           | Daftar tarif, buat tarif, aktif/nonaktif     |
| `/admin/pesanan`         | Semua pesanan, filter status                 |
| `/admin/pesanan/[id]`    | Detail pesanan, chat, rating, pembayaran     |
| `/admin/sos`             | Laporan SOS, tandai ditangani, selesaikan    |
| `/admin/pembayaran`      | Catat/ubah pembayaran dan statusnya          |

## Struktur folder

```
app/                  Rute, layout, metadata, OG image, sitemap, robots
app/admin/            Panel admin (route group (panel) + login)
app/api/auth/otp/     Route Handler kirim OTP (validasi + batas percobaan)
components/           Navbar, footer, ikon, mockup, kartu unduhan
components/admin/     Shell, auth provider, form login, UI panel admin
components/auth/      Form masuk/daftar
components/sections/  Section landing page
lib/admin/            Query data admin, RPC, format, pesan error
lib/auth/             Validasi email/HP dan pesan error OTP
lib/supabase/         Client browser dan alur OTP
lib/content.ts        Data layanan, tempat, fitur, langkah
lib/site.ts           Konfigurasi nama, URL, WhatsApp, Instagram
supabase/migrations/  SQL users, tabel marketplace, RLS, tarif, seed, akses admin
mobile/               Aplikasi pelanggan Expo (pesan, riwayat, chat, SOS)
driver/               Aplikasi driver Expo (cari, ambil, antar, chat, SOS)
public/               Logo, ilustrasi, dan foto tempat (PNG/JPG)
```

## Auth email (Supabase + Resend)

Verifikasi akun hanya lewat email: kode 6 digit, tanpa password. Nomor HP
opsional, disimpan sebagai kontak untuk driver, dan tidak diverifikasi.

### 1. Environment

Isi `.env.local` di root proyek:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# Server-only. Untuk operasional Resend, bukan dibaca aplikasi.
# Jangan pernah memberi awalan NEXT_PUBLIC_.
RESEND_API_KEY=
```

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` memang aman di bundle client. Jangan
pernah memakai atau menaruh `service_role`/secret key di kode client maupun
`NEXT_PUBLIC_*`. OTP dikirim Supabase lewat SMTP, jadi aplikasi tidak memanggil
Resend API secara langsung.

Saat deploy ke Vercel, tambahkan variabel yang sama di **Project Settings →
Environment Variables**. Route Handler `/api/auth/otp` membacanya di server;
`.env.local` tidak ikut ter-deploy.

### 2. Supabase Auth

Di dashboard Supabase:

1. **Authentication → Providers**: aktifkan **Email**, matikan **Phone**.
2. **Email → Confirm email**: ON.
3. **Authentication → Email Templates**: ubah **Confirm signup** dan
   **Magic Link** ke Bahasa Indonesia dan tampilkan `{{ .Token }}`. Contoh:

   ```html
   <h2>Kode masuk Godiand</h2>
   <p>Pakai kode ini untuk masuk atau daftar:</p>
   <p style="font-size:28px;font-weight:800;letter-spacing:8px">
     {{ .Token }}
   </p>
   <p>Kode berlaku sebentar. Abaikan email ini kalau kamu tidak meminta kode.</p>
   ```

4. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**` dan
     `https://domain-vercel-kamu/**`

### 3. Resend sebagai SMTP

1. Buat akun di [resend.com](https://resend.com), tambahkan domain, lalu
   pasang record DNS **SPF** dan **DKIM** sampai status domain terverifikasi.
2. Buat **API key**.
3. Di **Supabase → Authentication → SMTP Settings**, isi:
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: API key Resend
   - Sender email: alamat dari domain yang sudah terverifikasi
   - Sender name: `Godiand`

SMTP bawaan Supabase hanya mengirim ke email anggota tim dan sangat dibatasi;
SMTP kustom Resend diperlukan untuk pengguna nyata. Simpan API key hanya di
dashboard Resend/Supabase dan `.env.local`, bukan di kode client.

### 4. Database

Jalankan migration di **Supabase SQL Editor** sesuai urutan. Semuanya aman
dijalankan ulang dan tidak menghapus data lama.

1. [`20261119000000_users_email_auth.sql`](supabase/migrations/20261119000000_users_email_auth.sql)
   — tabel `public.users`, trigger dari `auth.users`, RLS profil.
2. [`20261119000100_marketplace_tables.sql`](supabase/migrations/20261119000100_marketplace_tables.sql)
   — tabel marketplace.
3. [`20261119000200_marketplace_rls.sql`](supabase/migrations/20261119000200_marketplace_rls.sql)
   — trigger, fungsi tarif, RLS, dan grant.
4. [`20261119000300_seed_banda_aceh.sql`](supabase/migrations/20261119000300_seed_banda_aceh.sql)
   — tempat di Banda Aceh dan tarif awal.
5. [`20261119000400_driver_app_access.sql`](supabase/migrations/20261119000400_driver_app_access.sql)
   — akses driver terverifikasi ke pesanan `pending`, indeks satu pesanan
   aktif per driver, dan fungsi `is_verified_driver()`.
6. [`20261119000500_admin_panel.sql`](supabase/migrations/20261119000500_admin_panel.sql)
   — tabel `admins`, `is_admin()`, policy baca admin, dan semua RPC admin.

Tanpa migration #1, akun auth tetap dibuat tetapi baris `public.users` tidak
muncul. Tanpa migration #3, RLS tidak aktif dan tarif tidak terhitung. Tanpa
migration #6, panel admin tidak bisa membaca apa pun.

Isi tabel:

| Tabel           | Kegunaan                                                  |
| --------------- | --------------------------------------------------------- |
| `users`         | Profil publik dari akun `auth.users`                      |
| `places`        | Tempat/patokan Banda Aceh dengan koordinat                |
| `drivers`       | Data driver, kendaraan, status, lokasi terakhir           |
| `merchants`     | Warung/mart/laundry, opsional terhubung ke `places`       |
| `menu_items`    | Menu atau layanan milik merchant                          |
| `fares`         | Tarif per layanan: dasar, per km, minimum, batas jarak    |
| `orders`        | Pesanan semua layanan, total dihitung otomatis            |
| `order_items`   | Rincian item makanan/belanja, harga disalin dari katalog  |
| `payments`      | Catatan tunai/QRIS, diisi di server                       |
| `sos_reports`   | Laporan darurat dari pelanggan/driver                     |
| `chat_messages` | Chat dalam pesanan                                         |
| `ratings`       | Rating driver setelah pesanan selesai                     |

Aturan akses utama:

- Tanpa login hanya bisa membaca tempat, tarif, merchant aktif, dan menu yang
  tersedia. Pesanan, pembayaran, chat, dan SOS tertutup.
- Pelanggan hanya melihat pesanannya sendiri. Driver terverifikasi bisa
  melihat pesanan `pending` yang belum diambil, lalu pesanan yang dia ambil.
  Merchant melihat pesanan untuk tokonya.
- Pelanggan membuat pesanan berstatus `pending` atas namanya sendiri. Status
  tidak diubah langsung dari client; pakai fungsi di bawah.
- Item pesanan hanya bisa ditambah oleh pemilik pesanan selama `pending`.
  Nama dan harga item disalin dari `menu_items`, bukan dari input client.
- `payments` tidak bisa ditulis client. Konfirmasi bayar harus lewat server
  dengan secret key nanti.
- Chat hanya untuk pelanggan dan driver pesanan itu; SOS hanya terbaca
  pelapornya.
- Admin (baris di `public.admins`) bisa membaca semua pesanan, pembayaran,
  SOS, chat, rating, driver, dan merchant. Penulisan tetap lewat RPC admin,
  bukan update langsung dari client.

Fungsi server yang bisa dipanggil dari aplikasi:

```sql
-- Estimasi tarif (layanan: ride, send, food, laundry, titip, mart)
select public.calculate_fare('ride', 3.4);

-- Dipanggil driver terverifikasi
select * from public.accept_order('<order-id>');
select * from public.update_order_status('<order-id>', 'in_progress');
select * from public.update_order_status('<order-id>', 'completed');

-- Pelanggan atau driver yang terkait
select * from public.cancel_order('<order-id>', 'Alasan opsional');
```

`delivery_fee` dihitung trigger dari `calculate_fare`; client tidak bisa
menentukan tarif sendiri. Tarif dibulatkan ke atas per Rp500 dan dibatasi
jarak maksimum per layanan.

`accept_order` menolak driver yang belum terverifikasi dan driver yang masih
punya pesanan `accepted`/`in_progress`. Indeks unik di migration #5 menjaga
aturan satu pesanan aktif per driver tetap berlaku.

Catatan seed dan pengaturan manual:

- 8 tempat diisi dengan koordinat perkiraan. Perbaiki lewat **Table Editor**
  bila perlu.
- 6 baris `fares` adalah **tarif awal** (berlaku 1 November 2026). Cek
  angkanya sebelum rilis; ubah di **Table Editor**, atau tambahkan baris baru
  dengan `effective_from` lebih baru.
- Tidak ada data driver, merchant, atau menu palsu. Daftarkan lewat akun
  sungguhan. Driver baru bisa mengambil pesanan setelah `drivers.is_verified`
  diubah ke `true` lewat panel admin atau dashboard.
- Akun admin pertama didaftarkan manual lewat SQL; lihat
  [Panel admin](#panel-admin-nextjs). Jangan memakai `service_role` di client.

Keterbatasan yang disengaja:

- Client tidak bisa mengubah status pesanan selain lewat fungsi, dan tidak
  bisa menulis pembayaran. Verifikasi pembayaran dan operasi lintas pengguna
  perlu Edge Function dengan secret key di tahap berikutnya.
- RLS menjaga baris, bukan isi kolom bebas seperti `notes`. Sanitasi teks
  tetap dilakukan di aplikasi.

### 5. Batas percobaan kirim OTP

`POST /api/auth/otp` memvalidasi format email, nama, dan nomor HP di server,
lalu meneruskan permintaan ke Supabase. Batasnya:

- 60 detik jeda per email, sama dengan hitung mundur di UI.
- 5 permintaan per email per 10 menit.
- 10 permintaan per IP per 10 menit.

Jatah email hanya terpakai saat pengiriman berhasil; percobaan yang ditolak
Supabase tidak mengunci email, tetapi tetap dihitung di jatah IP. Hitungan ini
disimpan di memori proses, jadi bisa berbeda antar-instance
serverless dan kembali ke nol saat proses dimulai ulang. Batas yang mengikat
adalah rate limit Supabase Auth; atur di **Authentication → Rate Limits**.
Form `/masuk` juga memblokir kirim ulang selama 60 detik.

### 6. Cara tes

1. Jalankan `npm run dev`, buka `/masuk`.
2. Pilih **Daftar**, isi nama, email kamu sendiri, dan nomor HP opsional
   (format `08...` atau `+628...`).
3. Cek inbox/spam untuk kode 6 digit.
4. Masukkan kode. Layar "Kamu sudah masuk" akan muncul.
5. Di Supabase Table Editor, cek `public.users`: baris baru dengan
   `email_verified = true`, serta `name`/`phone` sesuai input.
6. Coba **Masuk** dengan email yang sama.
7. Uji error: email salah format, nama kosong, HP salah format, kode salah,
   kode kedaluwarsa, dan kirim ulang sebelum 60 detik.
8. Cek validasi server langsung:

   ```bash
   curl -i -X POST http://localhost:3000/api/auth/otp \
     -H "Content-Type: application/json" \
     -d '{"email":"bukan-email","mode":"login"}'
   ```

   Harus membalas `400` dengan pesan "Format email belum benar."

## Aplikasi pelanggan (Expo)

Aplikasi mobile pelanggan ada di folder `mobile/` (Expo SDK 58 + Expo Router).
Isinya: masuk/daftar dengan email OTP, sesi tersimpan, tab Beranda, Pesan,
Riwayat, dan Akun, serta alur pemesanan lengkap sampai chat, SOS, dan rating.

Yang bisa dipakai:

- Enam layanan: ojek, antar, makan, laundry, titip, dan mart.
- Pilih titik jemput/tujuan dari `places`, atau warung/laundry terverifikasi.
  Jarak dihitung di HP, tarif diambil dari `calculate_fare`, lalu server
  menghitung ulang ongkir saat pesanan disimpan.
- Keranjang menu untuk makan dan mart; laundry boleh tanpa menu; titip wajib
  isi catatan.
- Riwayat dengan filter, detail pesanan, pembatalan, chat driver (polling 4
  detik), lapor darurat, dan rating setelah pesanan selesai.
- Akun: ubah nama dan nomor HP, lihat email, keluar.

### Menjalankan

```bash
cd mobile
cp .env.example .env.local   # isi dua variabel Supabase
npm install
npm start                    # scan QR dengan Expo Go
# atau
npm run web                  # pratinjau di browser
```

`EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` diisi
nilai yang sama dengan situs. Keduanya memang publik; jangan pernah menambah
`service_role` atau secret key. Bila keduanya kosong, aplikasi menampilkan
petunjuk konfigurasi, bukan form palsu.

OTP memakai Supabase Auth yang sama (template email + Resend dari bagian
sebelumnya). Aplikasi memanggil `signInWithOtp`/`verifyOtp` langsung tanpa
Route Handler, sehingga batas kirim mengikuti **Authentication → Rate
Limits** di Supabase. Sesi disimpan lewat AsyncStorage dan tetap masuk setelah
aplikasi ditutup.

### Struktur

```
mobile/src/app/         Rute: / (pengalihan), /masuk, (tabs)/ (beranda,
                        pesan, riwayat, akun), /pesan/[service],
                        /pesanan/[id], /chat/[orderId], /sos/[orderId]
mobile/src/features/    Form auth, hook pemesanan, ringkasan, rating
mobile/src/components/  UI bersama, header, pilihan, kartu pesanan, status
mobile/src/lib/         Tema, Supabase bertipe, sesi, validasi OTP, layanan,
                        format, jarak, dan lapisan data (places, merchants,
                        orders, chat, profile)
mobile/assets/          Ikon aplikasi dari logo Godiand
```

### Catatan alur

- Makan, laundry, dan mart butuh merchant aktif di tabel `merchants` dengan
  `is_verified = true` dan koordinat. Tidak ada merchant contoh; isi lewat
  dashboard, begitu juga `menu_items`. Tanpa itu, layanannya menampilkan
  keadaan kosong, bukan data palsu.
- Titik hanya bisa dipilih dari `places` yang sudah diisi. Belum ada peta,
  pencarian alamat bebas, atau geocoding.
- Pelanggan bisa membatalkan pesanan `pending` dan `accepted`. Status
  selanjutnya diubah driver lewat fungsi database, bukan dari aplikasi
  pelanggan.
- Chat memakai polling 4 detik, jadi tidak perlu mengaktifkan Realtime.
- SOS tersimpan di `sos_reports`; belum ada layar admin yang membacanya.
  Aplikasi menyarankan menghubungi 112 atau 110 untuk darurat.
- Pembayaran belum ada di aplikasi. Total tampil, tetapi tidak ada langkah
  bayar dan `payments` tetap hanya ditulis server.

### Pemeriksaan

```bash
cd mobile
npm run typecheck
npx expo-doctor
npx expo export --platform web
```

`mobile/` sengaja dikecualikan dari `tsconfig.json` dan ESLint root supaya
build Next.js tidak memeriksa kode React Native. Semua perintah mobile
dijalankan dari folder `mobile/`.

## Aplikasi driver (Expo)

Aplikasi driver ada di `driver/` (Expo SDK 58 + Expo Router). Akun memakai
email OTP yang sama dengan pelanggan, lalu driver mendaftarkan kendaraan dan
menunggu verifikasi admin. Setelah `drivers.is_verified = true`, driver bisa
online, melihat pesanan `pending`, dan mengambilnya.

Yang bisa dipakai:

- Daftar kendaraan motor/mobil dengan plat nomor; satu akun satu baris
  `drivers`. Akun baru otomatis `is_verified = false`.
- Layar verifikasi menampilkan data yang dikirim dan tombol muat ulang.
  Verifikasi dilakukan manual di dashboard Supabase.
- Status Online/Offline. Driver `busy` tidak bisa mengubah status sampai
  pesanan aktif selesai atau dibatalkan.
- Cari pesanan: hanya pesanan `pending` tanpa driver, maksimal 30 terbaru.
  Rincian item dan chat pelanggan baru terbuka setelah pesanan diambil.
- Alur pesanan: ambil → mulai antar (`in_progress`) → selesai (`completed`),
  lengkap dengan rute, tarif, chat (polling 4 detik), SOS, dan pembatalan
  selama `accepted`.
- Riwayat pesanan selesai/dibatalkan dan ringkasan rating di tab Akun.
- Satu pesanan aktif per driver, dijaga fungsi database dan indeks unik.

### Menjalankan

```bash
cd driver
cp .env.example .env.local   # isi dua variabel Supabase
npm install
npm start                    # scan QR dengan Expo Go
# atau
npm run web                  # pratinjau di browser
```

Nilai environment sama dengan situs dan aplikasi pelanggan. Hanya
`EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; jangan
menambah `service_role` atau secret key. Bila kosong, aplikasi menampilkan
petunjuk konfigurasi.

### Struktur

```
driver/src/app/         Rute: / (pengalihan), /masuk, /daftar, /verifikasi,
                        (tabs)/ (beranda, cari, riwayat, akun),
                        /pesanan/[id], /chat/[orderId], /sos/[orderId]
driver/src/components/  UI bersama, header, pilihan, kartu pesanan, status
driver/src/lib/         Tema, Supabase bertipe, sesi, konteks driver, layanan,
                        format, dan lapisan data (drivers, orders, chat)
driver/assets/          Ikon aplikasi dari logo Godiand
```

### Catatan alur

- Verifikasi driver belum punya layar admin. Buka **Table Editor → drivers**,
  ubah `is_verified` menjadi `true`, lalu driver menekan **Muat ulang** di
  layar verifikasi.
- Pesanan merchant (makan, laundry, mart) tetap berasal dari aplikasi
  pelanggan. Aplikasi driver tidak membuat pesanan.
- Pembayaran tunai/QRIS belum dicatat di aplikasi driver; total hanya
  ditampilkan. `payments` tetap hanya ditulis server.
- Lokasi driver belum dikirim langsung (tidak ada GPS realtime). Lokasi
  terakhir di tabel `drivers` belum diisi aplikasi.
- SOS dari driver masuk ke `sos_reports` dan belum ada layar yang
  membacanya. Untuk darurat, aplikasi menyarankan 112 atau 110.

### Pemeriksaan

```bash
cd driver
npm run typecheck
npx expo-doctor
npx expo export --platform web
```

`driver/` juga dikecualikan dari `tsconfig.json` dan ESLint root. Jalankan
semua perintah driver dari folder `driver/`.

## Panel admin (Next.js)

Panel admin memakai login email OTP yang sama dengan situs, lalu mengecek
`public.admins`. Tanpa baris admin, semua rute `/admin` (selain
`/admin/masuk`) tetap terkunci. Semua halaman admin `noindex` dan tidak
ditautkan dari situs publik.

### Membuat admin pertama

1. Daftar/masuk sekali di `/masuk` dengan email calon admin, lalu verifikasi
   OTP.
2. Di **Supabase SQL Editor** jalankan:

   ```sql
   insert into public.admins (user_id)
   select id from public.users where lower(email) = lower('admin@contoh.com')
   on conflict (user_id) do nothing;
   ```

3. Buka `/admin/masuk` dan masuk dengan email tersebut.

Peran tambahan (`role`) bisa diisi saat insert: `'admin'` (default) atau
`'superadmin'`. Cabut akses dengan menghapus baris di `public.admins`.

### Kemampuan

- **Driver & merchant**: verifikasi dan cabut verifikasi. Driver dengan
  pesanan aktif tidak bisa dicabut verifikasinya.
- **Tarif**: buat tarif baru per layanan dan tanggal berlaku, aktifkan atau
  nonaktifkan. Tarif baru langsung dipakai untuk pesanan berikutnya.
- **Pesanan**: lihat semua pesanan dengan filter status, buka detail (item,
  chat, rating, pembayaran), dan batalkan pesanan yang masih
  `pending`/`accepted`/`in_progress`. Pembatalan otomatis melepas driver ke
  `available`.
- **SOS**: tandai ditangani lalu selesaikan. Waktu penanganan dan admin yang
  menangani tercatat.
- **Pembayaran**: catat tunai/QRIS (nominal selalu dari total pesanan) dan
  ubah status `pending`/`paid`/`failed`/`refunded`.

Semua aksi tulis lewat RPC `security definer` di migration #6 dan ditolak di
server bila pemanggil bukan admin. Tidak ada tombol placeholder atau data
contoh di panel.

### Pemeriksaan

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Placeholder & konfigurasi

Aset visual lokal disimpan di `public/` dan bukan aset GoDieng.

- **Kontak**: ganti `whatsapp`, `whatsappDisplay`, dan `instagram` di
  `lib/site.ts` sebelum situs dipublikasikan. Nomor saat ini hanya contoh.
- **URL situs**: atur `NEXT_PUBLIC_SITE_URL` (dipakai metadata, sitemap,
  robots, dan data terstruktur). Bila kosong, dipakai
  `https://godiand.example`.
- **Logo, ilustrasi & foto**: `public/logo.png`, `public/logo-driver.png`,
  `public/ilustrasi-driver.png`, dan `public/places/*.jpg`. Ikon aplikasi
  dibuat dari `public/logo.png` menjadi `app/icon.png`.
- **App Store / Google Play**: tombol sengaja tidak bisa diklik dan diberi
  label "Segera hadir" sampai aplikasi benar-benar dirilis.
- **APK Android**: belum tersedia. Halaman `/unduh#apk` menjelaskan status
  resmi dan tidak menautkan file dari sumber lain.
- **Mockup hero**: isi layar (tarif Rp12.000, driver, jarak) hanya ilustrasi
  tampilan, bukan data nyata.

## SEO

Metadata lengkap (title, description, Open Graph, Twitter card, canonical,
robots), gambar OG yang dibuat saat build, manifest, `sitemap.xml`,
`robots.txt`, ikon, dan JSON-LD Organization/WebSite/Service. Halaman
`/masuk` dan seluruh `/admin` sengaja `noindex`; `robots.txt` juga menolak
`/admin`.

## Rencana tahap berikutnya

1. **Tahap 4 lanjutan**: peta pemilihan titik dan lokasi driver langsung di
   aplikasi pelanggan/driver.
2. **Tahap 7**: pembayaran QRIS online (Edge Function + secret key di server),
   verifikasi otomatis pembayaran, dan notifikasi.
3. **Operasional**: akun admin pertama, domain Resend, dan pengujian
   migration di proyek Supabase asli.
