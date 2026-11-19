import { Icon } from "./icons";

export function RoadStrip() {
  return (
    <div
      aria-hidden="true"
      className="relative h-14 overflow-hidden border-t-2 border-ink-900 bg-[#dbe7f0] sm:h-16"
    >
      <div className="gd-road-dash absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="gd-ride grid h-11 w-11 place-items-center rounded-full border-2 border-ink-900 bg-brand-600 text-white shadow-[3px_3px_0_#0b1c26]">
          <Icon name="bike" size={22} strokeWidth={2.2} />
        </div>
      </div>
    </div>
  );
}
