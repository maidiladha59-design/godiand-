import Image from "next/image";
import { places } from "@/lib/content";

export function Places() {
  return (
    <section className="overflow-x-clip border-y-2 border-ink-900 bg-brand-600 px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <span className="gd-label">Jalan-jalan</span>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            Mau ke mana hari ini?
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-brand-100">
            Pilih tujuan, lihat tarif, lalu berangkat. Tempat favorit di Banda
            Aceh tinggal sekali ketuk.
          </p>
        </div>

        <div className="no-scrollbar mx-auto mt-12 flex max-w-6xl snap-x gap-5 overflow-x-auto px-5 pb-9 pt-7 scroll-px-5 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0 lg:pt-0 lg:scroll-px-0">
          {places.map((place, index) => (
            <div
              key={place.name}
              data-reveal
              className="w-64 shrink-0 snap-center lg:w-auto"
            >
              <figure
                className={`gd-card p-3 transition-transform duration-300 hover:rotate-0 ${
                  index % 2 === 0 ? "-rotate-2" : "rotate-2"
                }`}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl border-2 border-ink-900 bg-brand-200">
                  <Image
                    src={place.image}
                    alt={place.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, 256px"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent"
                  />
                </div>
                <figcaption className="px-1 pb-1 pt-3">
                  <span className="block text-lg font-extrabold leading-tight">
                    {place.name}
                  </span>
                  <span className="mt-1 block text-sm text-ink-600">
                    {place.note}
                  </span>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
        <p className="mt-1 text-center text-xs font-bold text-brand-100 lg:hidden">
          Geser ke samping untuk lihat tempat lain →
        </p>
      </div>
    </section>
  );
}
