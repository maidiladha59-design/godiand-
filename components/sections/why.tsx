import { Icon } from "@/components/icons";
import { features } from "@/lib/content";

export function Why() {
  return (
    <section className="bg-white px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <span className="gd-label">Kenapa Godiand</span>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Jelas di awal, tenang{" "}
            <span className="gd-mark">sampai tujuan</span>
          </h2>
        </div>

        <div className="mx-auto mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              data-reveal
              className={`gd-card gd-lift h-full p-6 ${feature.tint}`}
            >
              <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink-900 bg-white">
                <Icon
                  name={feature.icon}
                  size={23}
                  className="text-brand-700"
                />
              </span>
              <h3 className="mt-4 text-lg font-extrabold leading-tight">
                {feature.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-700">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
