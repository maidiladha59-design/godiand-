import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { site, waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Cara GoDiand mengumpulkan, memakai, dan melindungi data pelanggan serta mitra driver di Banda Aceh.",
  alternates: { canonical: "/privasi" },
};

export default function PrivasiPage() {
  return (
    <>
      <PageHero
        label="Privasi"
        title="Kebijakan Privasi"
        description="Kami pakai data seperlunya untuk menjalankan pesanan dan menjaga keamanan. Bukan untuk dijual."
        meta="Terakhir diperbarui: 18 November 2026"
      />

      <article className="gd-container legal-prose max-w-3xl py-14">
        <p>
          Kebijakan ini berlaku untuk situs dan aplikasi GoDiand, layanan ojek,
          antar barang, makanan, laundry, titip beli, dan belanja di Banda
          Aceh. Dengan memakai GoDiand, kamu setuju dengan cara pengelolaan
          data di bawah ini.
        </p>

        <h2>1. Ringkasnya</h2>
        <p>
          Kami hanya meminta data yang dibutuhkan untuk menghubungkan kamu
          dengan driver, menghitung tarif, memproses pesanan, dan menangani
          masalah. Pembayaran dilakukan langsung ke driver, jadi GoDiand tidak
          menyimpan saldo atau data kartu.
        </p>

        <h2>2. Data yang kami kumpulkan</h2>
        <ul>
          <li>Nomor HP dan kode OTP untuk membuat serta mengamankan akun.</li>
          <li>Nama dan foto profil bila kamu mengisinya.</li>
          <li>Titik jemput, tujuan, dan rute perjalanan saat pesanan aktif.</li>
          <li>Detail pesanan, termasuk menu, barang, alamat, dan catatan.</li>
          <li>Isi chat dengan driver dan laporan tombol SOS.</li>
          <li>Informasi perangkat dasar, seperti jenis perangkat dan versi aplikasi.</li>
        </ul>

        <h2>3. Cara kami memakai data</h2>
        <ul>
          <li>Menampilkan tarif dan memproses pesanan.</li>
          <li>Meneruskan pesanan ke driver yang sesuai.</li>
          <li>Menghubungkan chat, status perjalanan, dan foto serah terima.</li>
          <li>Menangani laporan SOS, sengketa, dan permintaan dukungan.</li>
          <li>Mencegah penyalahgunaan dan memperbaiki layanan.</li>
        </ul>

        <h2>4. Pembayaran</h2>
        <p>
          Kamu membayar tunai atau QRIS langsung ke driver. GoDiand tidak
          menyimpan saldo, tidak meminta top-up, dan tidak memproses data kartu
          pembayaran. Bukti pembayaran dapat dikonfirmasi oleh driver di
          aplikasi.
        </p>

        <h2>5. Lokasi dan keamanan</h2>
        <p>
          Lokasi dipakai saat kamu memesan atau saat driver menjalankan
          pesanan, termasuk untuk menampilkan posisi driver. Kamu bisa mencabut
          izin lokasi lewat pengaturan perangkat, tetapi beberapa fitur pesanan
          mungkin tidak berjalan tanpa izin tersebut. Laporan SOS dan chat
          terkait dapat disimpan untuk keperluan penyelidikan dan keamanan.
        </p>

        <h2>6. Berbagi data</h2>
        <p>
          Data pesanan dibagikan kepada driver yang menangani pesananmu dan
          penyedia infrastruktur yang membantu kami menjalankan layanan. Kami
          tidak menjual data pribadi. Data juga dapat dibuka bila diwajibkan
          oleh hukum yang berlaku di Indonesia.
        </p>

        <h2>7. Penyimpanan dan keamanan</h2>
        <p>
          Data disimpan selama akun aktif dan selama diperlukan untuk
          operasional, keamanan, atau kewajiban hukum. Kami membatasi akses ke
          data dan memakai koneksi yang aman. Tidak ada sistem yang sepenuhnya
          bebas risiko, jadi jaga juga kerahasiaan kode OTP milikmu.
        </p>

        <h2>8. Hak kamu</h2>
        <p>
          Kamu dapat meminta akses, koreksi, atau penghapusan data. Panduan
          lengkap ada di halaman{" "}
          <Link href="/hapus-akun">hapus akun</Link>. Untuk permintaan lain,
          hubungi kami lewat WhatsApp.
        </p>

        <h2>9. Pengguna di bawah umur</h2>
        <p>
          Layanan ini ditujukan untuk pengguna berusia 18 tahun ke atas, atau
          yang memakai layanan dengan pengawasan orang tua atau wali.
        </p>

        <h2>10. Perubahan kebijakan</h2>
        <p>
          Kebijakan ini bisa diperbarui. Versi terbaru selalu ditampilkan di
          halaman ini dengan tanggal pembaruan di atas.
        </p>

        <h2>11. Hubungi kami</h2>
        <p>
          Pertanyaan soal privasi bisa dikirim ke{" "}
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp GoDiand
          </a>{" "}
          atau {site.whatsappDisplay}.
        </p>
      </article>
    </>
  );
}
