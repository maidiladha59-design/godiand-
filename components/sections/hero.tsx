import Link from "next/link";
import { HeroBadge } from "@/components/hero-badge";
import { Icon } from "@/components/icons";
import { RoadStrip } from "@/components/road-strip";
import { HeroStoreButtons } from "@/components/store-badges";

export function Hero() {
  return (
    <section className="relative overflow-x-clip border-b-2 border-ink-900 bg-brand-100">
      <div
        aria-hidden="true"
        className="gd-dots absolute inset-0 opacity-70"
      />
      <div
        aria-hidden="true"
        className="gd-drift pointer-events-none absolute -inset-24 text-brand-300 opacity-70"
      >
        <svg
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
        >
          <path d="M-30 250C40 210 70 140 150 132s120 40 200 8 90-82 110-140" />
          <path d="M-40 180C40 150 90 80 170 84s90 56 150 34 70-64 120-80" />
          <path d="M-20 320C80 260 120 220 210 216s130 34 230-10" />
          <path d="M60-20c40 60 30 120 90 160s150 20 190 80 30 90 80 120" />
          <path d="M300-30c-30 50-10 90 30 120s60 70 30 110-70 50-90 90" />
          <path
            d="M-10 90c70 6 110 34 150 30s80-40 130-34 90 34 140 20"
            strokeDasharray="5 7"
          />
          <path
            d="M-10 268c90-18 150-6 210-24s110-58 210-52"
            strokeDasharray="5 7"
          />
        </svg>
      </div>
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sun-300/40"
      />

      <div className="gd-container relative grid items-center gap-10 pb-14 pt-10 sm:pb-20 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pb-24">
        <div>
          <span className="gd-up inline-flex items-center gap-1.5 rounded-full border-2 border-ink-900 bg-white px-3 py-1.5 text-sm font-bold">
            <Icon name="pin" size={16} className="text-brand-700" />
            Banda Aceh · Serambi Mekkah
          </span>

          <h1
            className="gd-up mt-5 max-w-xl text-[clamp(2.55rem,7vw,4.4rem)] font-extrabold leading-[1.02] tracking-tight"
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

          <div className="gd-up mt-7" style={{ animationDelay: "240ms" }}>
            <HeroStoreButtons />
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
