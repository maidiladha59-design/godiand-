import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { site, waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hapus akun",
  description:
    "Panduan menghapus akun Godiand dan data pribadi kamu.",
  alternates: { canonical: "/hapus-akun" },
};

const deletionSteps = [
  "Kirim pesan dari nomor HP yang terdaftar ke WhatsApp Godiand dengan format: Hapus akun Godiand — [nama kamu].",
  "Kami kirim kode OTP untuk memastikan permintaan benar dari pemilik akun.",
  "Setelah terverifikasi, akun dan data terkait dihapus maksimal 14 hari kerja.",
];

export default function HapusAkunPage() {
  return (
    <>
      <PageHero
        label="Akun"
        title="Hapus akun Godiand"
        description="Kamu bisa minta akun dan data pribadi dihapus kapan saja. Prosesnya sederhana dan tanpa biaya."
        meta="Berlaku untuk akun pelanggan dan mitra driver."
      />

      <section className="gd-container max-w-3xl py-14">
        <div className="gd-card p-6 sm:p-8">
          <h2 className="text-xl font-extrabold">Cara mengajukan</h2>
          <ol className="mt-4 space-y-4">
            {deletionSteps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink-900 bg-sun-400 text-sm font-extrabold">
                  {index + 1}
                </span>
                <span className="pt-1 text-[15px] leading-relaxed text-ink-700">
                  {step}
                </span>
              </li>
            ))}
          </ol>

          <a
            href={waLink(
              "Halo Godiand, saya mau menghapus akun. Nama saya: ",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="gd-btn gd-btn-primary mt-6"
          >
            <Icon name="whatsapp" size={19} />
            Minta hapus akun
          </a>
          <p className="mt-3 text-xs font-semibold text-ink-500">
            WhatsApp: {site.whatsappDisplay}
          </p>
        </div>

        <div className="legal-prose mt-10">
          <h2>Apa yang dihapus</h2>
          <ul>
            <li>Profil, nama, dan nomor HP.</li>
            <li>Riwayat lokasi dan alamat yang tersimpan.</li>
            <li>Isi chat dengan driver, sepanjang tidak terkait laporan keamanan.</li>
            <li>Preferensi layanan dan data akun lainnya.</li>
          </ul>

          <h2>Apa yang mungkin masih disimpan</h2>
          <p>
            Catatan transaksi dan laporan SOS dapat disimpan sementara bila
            dibutuhkan untuk kewajiban hukum, penyelesaian sengketa, atau
            keamanan. Data tersebut tidak dipakai untuk pemasaran.
          </p>

          <h2>Kalau tidak bisa akses nomor lama</h2>
          <p>
            Hubungi WhatsApp Godiand dan jelaskan situasinya. Tim kami akan
            membantu verifikasi dengan cara lain. Jangan pernah membagikan kode
            OTP kepada siapa pun selain melalui proses resmi ini.
          </p>

          <h2>Catatan versi awal</h2>
          <p>
            Aplikasi Godiand belum dirilis. Permintaan hapus akun baru bisa
            diproses setelah akun aplikasi aktif. Untuk saat ini, pesan
            WhatsApp tetap bisa dikirim agar kamu tercatat.
          </p>
        </div>
      </section>
    </>
  );
}
