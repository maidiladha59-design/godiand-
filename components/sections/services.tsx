import { Icon } from "@/components/icons";
import { services } from "@/lib/content";

export function Services() {
  return (
    <section id="layanan" className="scroll-mt-20 bg-mist px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <span className="gd-label">Layanan</span>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Satu aplikasi,{" "}
            <span className="text-brand-700">enam layanan</span>
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-600">
            Dari ojek pagi ke kantor sampai titip belanja di pasar. Semua
            diurus driver lokal Banda Aceh.
          </p>
        </div>

        <div className="mx-auto mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.name}
              data-reveal
              className="gd-card gd-lift flex h-full flex-col p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`grid h-14 w-14 place-items-center rounded-xl border-2 border-ink-900 ${service.tint} ${service.iconColor}`}
                >
                  <Icon name={service.icon} size={28} />
                </span>
                <span className="rounded-full border-2 border-ink-900 bg-white px-2.5 py-0.5 text-[11px] font-bold">
                  {service.tag}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-extrabold sm:text-2xl">
                {service.name}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
