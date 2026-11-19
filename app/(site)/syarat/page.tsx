import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { site, waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Syarat Layanan",
  description:
    "Aturan penggunaan layanan Godiand untuk pelanggan dan mitra driver di Banda Aceh.",
  alternates: { canonical: "/syarat" },
};

export default function SyaratPage() {
  return (
    <>
      <PageHero
        label="Syarat"
        title="Syarat Layanan"
        description="Aturan main biar pesanan aman dan nyaman untuk pelanggan, driver, dan mitra warung."
        meta="Terakhir diperbarui: 18 November 2026"
      />

      <article className="gd-container legal-prose max-w-3xl py-14">
        <p>
          Syarat ini mengatur penggunaan situs dan aplikasi Godiand. Dengan
          membuat akun atau memakai layanan, kamu setuju pada aturan berikut.
        </p>

        <h2>1. Tentang layanan</h2>
        <p>
          Godiand menghubungkan pelanggan dengan mitra driver lokal di Banda
          Aceh untuk perjalanan, pengiriman barang, makanan, laundry, titip
          beli, dan belanja. Mitra driver adalah pengguna independen, bukan
          karyawan Godiand.
        </p>

        <h2>2. Akun dan keamanan</h2>
        <ul>
          <li>Gunakan nomor HP yang aktif dan bisa menerima OTP.</li>
          <li>Jaga kode OTP; jangan bagikan ke siapa pun, termasuk yang mengaku pihak Godiand.</li>
          <li>Satu akun untuk satu orang. Jangan membuat akun palsu atau memakai akun orang lain.</li>
        </ul>

        <h2>3. Tarif dan pembayaran</h2>
        <ul>
          <li>Tarif ditampilkan sebelum pesanan dibuat.</li>
          <li>Pembayaran dilakukan tunai atau QRIS langsung ke driver.</li>
          <li>Tidak ada saldo, top-up, atau potongan tersembunyi.</li>
          <li>Tarif dapat menyesuaikan jarak, layanan, dan ketentuan yang berlaku di aplikasi.</li>
        </ul>

        <h2>4. Pesanan, pembatalan, dan penolakan</h2>
        <p>
          Pesan hanya bila benar-benar akan berangkat. Driver dapat menolak
          pesanan, misalnya karena jarak, kondisi jalan, atau ketersediaan.
          Pembatalan oleh pelanggan dapat dikenai biaya bila driver sudah
          menuju lokasi; ketentuan rinci akan ditampilkan di aplikasi sebelum
          konfirmasi.
        </p>

        <h2>5. Barang, makanan, dan titipan</h2>
        <ul>
          <li>Jangan mengirim barang ilegal, berbahaya, mudah meledak, atau dilarang hukum.</li>
          <li>Untuk makanan, cek pesanan saat diterima dan laporkan masalah secepatnya.</li>
          <li>Untuk titip beli dan belanja, pastikan daftar barang dan alamat jelas.</li>
          <li>Foto serah terima dipakai sebagai bukti penyerahan barang.</li>
        </ul>

        <h2>6. Laundry dan GodiandMart</h2>
        <p>
          Pelanggan wajib memeriksa isi cucian sebelum diserahkan dan
          menyimpan barang berharga di tempat terpisah. Untuk belanja dari
          Indomaret atau Alfamart, struk dan barang dicek bersama driver saat
          diterima.
        </p>

        <h2>7. Keselamatan</h2>
        <p>
          Gunakan chat dan tombol SOS bila merasa tidak aman. Ikuti petunjuk
          keselamatan di aplikasi, pakai helm untuk perjalanan, dan jangan
          meminta driver melanggar lalu lintas. Jangan bagikan data sensitif
          seperti PIN atau kode OTP kepada driver.
        </p>

        <h2>8. Larangan</h2>
        <ul>
          <li>Melecehkan, mengancam, atau melakukan kekerasan kepada pengguna lain.</li>
          <li>Melakukan penipuan, manipulasi tarif, atau pemesanan fiktif.</li>
          <li>Mengganggu sistem, menyalahgunakan aplikasi, atau memalsukan identitas.</li>
        </ul>

        <h2>9. Tanggung jawab</h2>
        <p>
          Godiand berupaya menjaga layanan berjalan baik, tetapi tidak menjamin
          layanan selalu bebas gangguan. Tanggung jawab kami dibatasi sejauh
          yang diizinkan hukum yang berlaku. Keadaan di luar kendali, seperti
          bencana, cuaca ekstrem, atau gangguan jaringan, dapat memengaruhi
          pesanan.
        </p>

        <h2>10. Perubahan dan hukum yang berlaku</h2>
        <p>
          Syarat ini dapat diperbarui dan versi terbaru selalu ditampilkan di
          halaman ini. Syarat ini tunduk pada hukum Indonesia. Sengketa
          diupayakan diselesaikan secara musyawarah terlebih dahulu.
        </p>

        <h2>11. Kontak</h2>
        <p>
          Pertanyaan soal syarat layanan bisa dikirim lewat{" "}
          <a
            href={waLink("Halo Godiand, saya mau tanya soal syarat layanan.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp Godiand
          </a>{" "}
          atau {site.whatsappDisplay}. Lihat juga{" "}
          <Link href="/privasi">Kebijakan Privasi</Link>.
        </p>
      </article>
    </>
  );
}
