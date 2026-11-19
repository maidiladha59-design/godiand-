import { Icon } from "@/components/icons";

const facts = [
  "MULAI RP9.000",
  "6 LAYANAN",
  "TARIF JELAS",
  "DRIVER LOKAL",
  "BANDA ACEH",
  "TUNAI / QRIS",
  "ADA TOMBOL SOS",
];

function TickerGroup() {
  return (
    <div className="flex shrink-0 items-center">
      {facts.map((fact) => (
        <span
          key={fact}
          className="flex items-center gap-4 pr-4 text-[13px] font-extrabold uppercase tracking-[0.12em] sm:text-sm"
        >
          {fact}
          <Icon
            name="star"
            size={14}
            strokeWidth={2.2}
            className="shrink-0 fill-current"
          />
        </span>
      ))}
    </div>
  );
}

export function Ticker() {
  return (
    <section
      aria-label="Fakta GoDiand"
      className="relative z-10 overflow-hidden"
    >
      <div className="relative -ml-[2%] w-[104%] -rotate-1 border-y-2 border-ink-900 bg-sun-400 py-2 sm:py-2.5">
        <p className="sr-only">
          Mulai Rp9.000, enam layanan, tarif jelas, driver lokal Banda Aceh,
          bayar tunai atau QRIS, dan ada tombol SOS.
        </p>
        <div aria-hidden="true" className="gd-marquee flex w-max">
          <TickerGroup />
          <TickerGroup />
        </div>
      </div>
    </section>
  );
}
