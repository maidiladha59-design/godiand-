import { infoChips } from "@/lib/content";
import { Icon } from "@/components/icons";

export function InfoChips() {
  return (
    <section aria-label="Info singkat" className="border-b-2 border-ink-900 bg-white">
      <div className="gd-container flex flex-wrap items-center justify-center gap-2.5 py-4 sm:gap-3">
        {infoChips.map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-2 rounded-full border-2 border-ink-900 bg-mist px-3.5 py-2 text-[13px] font-bold sm:text-sm"
          >
            <Icon name={chip.icon} size={16} className="text-brand-700" />
            {chip.label}
          </span>
        ))}
      </div>
    </section>
  );
}
