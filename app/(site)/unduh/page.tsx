import type { Metadata } from "next";
import Link from "next/link";
import { DownloadCards } from "@/components/download-cards";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Unduh aplikasi",
  description:
    "Unduh aplikasi Godiand untuk pelanggan dan Godiand Driver untuk mitra. Versi App Store, Google Play, dan APK Android sedang disiapkan.",
  alternates: { canonical: "/unduh" },
};

const installSteps = [
  "Buka halaman ini saat versi Android resmi dirilis.",
  "Unduh file APK resmi Godiand dari tautan di halaman ini.",
  "Izinkan instalasi dari browser, lalu pasang seperti biasa.",
];

export default function UnduhPage() {
  return (
    <>
      <PageHero
        label="Unduh"
        title="Godiand di ponselmu"
        description="Aplikasi pelanggan dan aplikasi mitra driver. Semua urusan di Banda Aceh jadi sat-set."
        meta="Status: versi iPhone dan Android segera hadir."
      />

      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <DownloadCards />
        </div>
      </section>

      <section
        id="apk"
        className="scroll-mt-24 px-4 pb-16 sm:pb-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="gd-card overflow-hidden">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className="p-6 sm:p-8">
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink-900 bg-coral-50 px-3 py-1 text-xs font-extrabold text-coral-700">
                  <Icon name="alert" size={14} />
                  Belum tersedia
                </span>
                <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">
                  APK Android
                </h2>
                <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-600">
                  Versi Android sedang disiapkan. APK resmi nanti bisa diunduh
                  dari halaman ini. Demi keamanan, jangan pasang file APK dari
                  sumber yang tidak dikenal.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={waLink(
                      "Halo Godiand, saya mau tanya kabar rilis aplikasi Android.",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gd-btn gd-btn-primary"
                  >
                    <Icon name="whatsapp" size={19} />
                    Tanya kabar rilis
                  </a>
                  <Link
                    href="/#layanan"
                    className="gd-btn border-ink-900 bg-white text-ink-900"
                  >
                    Lihat layanan
                    <Icon name="arrow-right" size={17} />
                  </Link>
                </div>
              </div>

              <div className="border-t-2 border-ink-900 bg-mist p-6 sm:p-8 lg:border-l-2 lg:border-t-0">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-500">
                  Nanti saat rilis
                </h3>
                <ol className="mt-4 space-y-4">
                  {installSteps.map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-ink-900 bg-sun-400 text-xs font-extrabold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold leading-relaxed text-ink-700">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-5 text-xs font-semibold text-ink-500">
                  Tautan APK akan dipasang di bagian ini begitu build Android
                  siap.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
