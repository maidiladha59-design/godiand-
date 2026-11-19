import { Icon } from "@/components/icons";

const words = [
  "GODIANDRIDE",
  "GODIANDSEND",
  "GODIANDFOOD",
  "GODIANDLAUNDRY",
  "GODIANDTITIP",
  "GODIANDMART",
];

function TickerGroup() {
  return (
    <div className="flex shrink-0 items-center">
      {words.map((word) => (
        <span
          key={word}
          className="flex items-center gap-5 pr-5 text-lg font-extrabold uppercase tracking-wide sm:text-xl"
        >
          {word}
          <Icon name="sparkles" size={18} strokeWidth={2.4} className="shrink-0" />
        </span>
      ))}
    </div>
  );
}

export function Ticker() {
  return (
    <section
      aria-label="Layanan GoDiand"
      className="relative z-10 overflow-hidden py-4 sm:py-5"
    >
      <div className="relative -ml-[2%] w-[104%] -rotate-1 border-y-4 border-ink-900 bg-sun-400 py-3.5">
        <p className="sr-only">
          GoDiandRide, GoDiandSend, GoDiandFood, GoDiandLaundry, GoDiandTitip,
          dan GoDiandMart.
        </p>
        <div aria-hidden="true" className="gd-marquee flex w-max">
          <TickerGroup />
          <TickerGroup />
        </div>
      </div>
    </section>
  );
}
