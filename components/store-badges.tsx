import type { IconName } from "./icons";
import { Icon } from "./icons";
import { apkFileName, apkHref } from "@/lib/apk";

const stores: { name: string; icon: IconName }[] = [
  { name: "App Store", icon: "smartphone" },
  { name: "Google Play", icon: "play" },
];

export function HeroStoreButtons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a
        href={apkHref}
        download={apkFileName}
        className="gd-lift inline-flex min-h-14 items-center gap-3 rounded-xl border-2 border-ink-900 bg-ink-900 px-4 text-white shadow-[4px_4px_0_#0b1c26]"
      >
        <Icon name="download" size={22} strokeWidth={2.4} />
        <span className="flex flex-col items-start leading-none">
          <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
            Unduh langsung
          </span>
          <span className="mt-1 text-[15px] font-extrabold">APK Android</span>
        </span>
      </a>

      <span
        aria-disabled="true"
        className="inline-flex min-h-14 cursor-default items-center gap-3 rounded-xl border-2 border-dashed border-ink-900 bg-white/70 px-4 text-ink-600"
      >
        <Icon name="play" size={20} className="fill-current" />
        <span className="flex flex-col items-start leading-none">
          <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
            Segera hadir di
          </span>
          <span className="mt-1 text-[15px] font-extrabold">Google Play</span>
        </span>
        <span className="sr-only">Belum tersedia untuk diunduh</span>
      </span>
    </div>
  );
}

export function StoreBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2.5 ${className}`}>
      {stores.map((store) => (
        <span
          key={store.name}
          aria-disabled="true"
          className="inline-flex min-h-12 cursor-default items-center gap-2.5 rounded-xl border-2 border-dashed border-ink-900 bg-white/75 px-3.5 text-ink-600"
        >
          <Icon name={store.icon} size={20} />
          <span className="flex flex-col leading-none">
            <span className="text-[10px] font-bold uppercase tracking-wide">
              Segera hadir
            </span>
            <span className="mt-1 text-sm font-extrabold">{store.name}</span>
          </span>
          <span className="sr-only">Belum tersedia untuk diunduh</span>
        </span>
      ))}
    </div>
  );
}
