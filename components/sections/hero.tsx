import Link from "next/link";
import { HeroBadge } from "@/components/hero-badge";
import { Icon } from "@/components/icons";
import { RoadStrip } from "@/components/road-strip";
import { StoreBadges } from "@/components/store-badges";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-100">
      <div
        aria-hidden="true"
        className="gd-dots absolute inset-0 opacity-60"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sun-300/50"
      />
      <div className="gd-container relative grid items-center gap-10 pb-14 pt-12 sm:pb-20 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pb-24">
        <div>
          <span className="gd-up inline-flex items-center gap-1.5 rounded-full border-2 border-ink-900 bg-white px-3 py-1.5 text-sm font-bold">
            <Icon name="pin" size={16} className="text-brand-700" />
            Banda Aceh · Serambi Mekkah
          </span>

          <h1
            className="gd-up mt-5 max-w-xl text-[clamp(2.55rem,7vw,4.4rem)] font-extrabold leading-[1.03] tracking-tight"
            style={{ animationDelay: "80ms" }}
          >
            Ojek, antar, makan. Semua{" "}
            <span className="gd-mark">sat-set</span> di Banda Aceh.
          </h1>

          <p
            className="gd-up mt-5 max-w-lg text-[17px] leading-relaxed text-ink-700 sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            Pesan dari driver lokal Banda Aceh. Tarif tampil sebelum pesan,
            bayar tunai atau QRIS langsung ke driver, ada chat dan tombol SOS.
          </p>

          <div
            className="gd-up mt-7"
            style={{ animationDelay: "240ms" }}
          >
            <StoreBadges />
            <p className="mt-2.5 text-xs font-semibold text-ink-600">
              Aplikasi iPhone dan Android sedang disiapkan.
            </p>
          </div>

          <Link
            href="#layanan"
            className="gd-up mt-6 inline-flex items-center gap-1.5 text-[15px] font-extrabold text-brand-800 underline decoration-2 underline-offset-4 transition-colors hover:text-brand-950"
            style={{ animationDelay: "320ms" }}
          >
            Lihat semua layanan
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>

        <div className="gd-up relative" style={{ animationDelay: "200ms" }}>
          <HeroBadge />
        </div>
      </div>
      <RoadStrip />
    </section>
  );
}
