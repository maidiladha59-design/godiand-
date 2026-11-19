import Link from "next/link";
import { DownloadCards } from "@/components/download-cards";
import { Icon } from "@/components/icons";

export function DownloadSection() {
  return (
    <section
      id="unduh"
      className="scroll-mt-20 bg-mist px-4 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <span className="gd-label">Unduh</span>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Dua aplikasi, satu kota
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-600">
            Aplikasi untuk pelanggan dan untuk mitra driver. Versi iPhone dan
            Android sedang disiapkan.
          </p>
        </div>

        <div className="mt-12">
          <DownloadCards />
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/unduh#apk"
            className="inline-flex items-center gap-2 text-[15px] font-extrabold text-brand-800 underline decoration-2 underline-offset-4 hover:text-brand-950"
          >
            <Icon name="download" size={17} />
            Info APK Android
            <Icon name="chevron-right" size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
