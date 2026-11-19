import { PhoneMockup } from "@/components/phone-mockup";
import { steps } from "@/lib/content";

export function How() {
  return (
    <section
      id="cara"
      className="scroll-mt-20 border-y-2 border-ink-900 bg-ink-900 px-4 py-16 text-white sm:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <span className="gd-label">Cara pesan</span>
          <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Tiga langkah, langsung berangkat
          </h2>
        </div>

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute left-[16%] right-[16%] top-8 hidden border-t-2 border-dashed border-brand-400 md:block lg:hidden"
            />
            <ol className="relative grid gap-5 md:grid-cols-3 lg:grid-cols-1">
              {steps.map((step, index) => (
                <li key={step.title} data-reveal>
                  <div className="h-full rounded-2xl border-2 border-ink-900 bg-white p-6 text-ink-900 shadow-gd-sun">
                    <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-ink-900 bg-sun-400 text-xl font-extrabold">
                      {index + 1}
                    </span>
                    <h3 className="mt-4 text-xl font-extrabold">{step.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div data-reveal className="flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
