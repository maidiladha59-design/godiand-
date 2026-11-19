import type { IconName } from "./icons";
import { Icon } from "./icons";

const stores: { name: string; icon: IconName }[] = [
  { name: "App Store", icon: "smartphone" },
  { name: "Google Play", icon: "play" },
];

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
