import { Icon } from "./icons";

export function RoadStrip() {
  return (
    <div
      aria-hidden="true"
      className="relative h-20 overflow-hidden border-t-4 border-ink-900 bg-ink-900 sm:h-24"
    >
      <div className="gd-road-dash absolute left-0 top-[calc(50%-5px)] h-2.5 w-[200%]" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="gd-ride grid h-16 w-16 place-items-center rounded-full border-[3px] border-ink-900 bg-brand-500 text-white shadow-[0_6px_0_#082b3e] sm:h-[4.5rem] sm:w-[4.5rem]">
          <Icon name="bike" size={30} strokeWidth={2.4} />
        </div>
      </div>
    </div>
  );
}
