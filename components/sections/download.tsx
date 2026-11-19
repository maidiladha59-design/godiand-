import { DownloadCards } from "@/components/download-cards";
import { Icon } from "@/components/icons";
import { apkFileName, apkHref } from "@/lib/apk";

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
            Aplikasi untuk pelanggan dan untuk mitra driver. APK Android sudah
            bisa dicoba; versi iPhone dan Google Play segera hadir.
          </p>
        </div>

        <div className="mt-12">
          <DownloadCards />
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={apkHref}
            download={apkFileName}
            className="inline-flex items-center gap-2 text-[15px] font-extrabold text-brand-800 underline decoration-2 underline-offset-4 hover:text-brand-950"
          >
            <Icon name="download" size={17} />
            Unduh APK Android
            <Icon name="chevron-right" size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
