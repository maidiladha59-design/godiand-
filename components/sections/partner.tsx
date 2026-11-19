import Image from "next/image";
import { Icon } from "@/components/icons";
import { site, waLink } from "@/lib/site";

const perks = [
  "Atur sendiri kapan mau aktif.",
  "Terima pesanan di sekitar Banda Aceh.",
  "Lihat penghasilan dan setoran harian.",
];

export function Partner() {
  return (
    <section
      id="driver"
      className="relative scroll-mt-20 overflow-hidden bg-sun-50 px-4 py-16 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="gd-dots absolute inset-0 opacity-40"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div data-reveal>
          <span className="gd-label">Mitra driver</span>
          <h2 className="mt-4 max-w-lg text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Punya motor dan tinggal di Banda Aceh?
          </h2>
          <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-ink-700">
            Gabung jadi mitra Godiand Driver. Atur sendiri kapan aktif, terima
            pesanan sekitar kota, dan pantau penghasilan harian plus setoran
            dari satu aplikasi.
          </p>

          <ul className="mt-6 space-y-2.5">
            {perks.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-2.5 text-[15px] font-semibold text-ink-800"
              >
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-ink-900 bg-white">
                  <Icon name="check" size={11} strokeWidth={3} />
                </span>
                {perk}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={waLink(
                "Halo Godiand, saya mau daftar jadi mitra driver di Banda Aceh.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="gd-btn gd-btn-primary"
            >
              <Icon name="whatsapp" size={19} />
              Tanya via WhatsApp
            </a>
            <span className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-ink-900 bg-white/70 px-3 py-2 text-xs font-bold text-ink-600">
              <Icon name="smartphone" size={16} />
              Aplikasi mitra segera hadir
            </span>
          </div>
          <p className="mt-3 text-xs font-semibold text-ink-500">
            Nomor WhatsApp: {site.whatsappDisplay}
          </p>
        </div>

        <div data-reveal className="relative mx-auto w-full max-w-md">
          <div className="gd-card rotate-2 p-3">
            <div className="overflow-hidden rounded-xl border-2 border-ink-900 bg-brand-100">
              <Image
                src="/ilustrasi-driver.png"
                alt="Ilustrasi driver Godiand sedang menerima pesanan lewat ponsel"
                width={1536}
                height={1024}
                sizes="(min-width: 1024px) 448px, 90vw"
                className="h-auto w-full"
              />
            </div>
            <div className="flex items-center justify-between px-1 pb-1 pt-3">
              <span className="text-lg font-extrabold">Godiand Driver</span>
              <span className="rounded-full border-2 border-ink-900 bg-sun-400 px-2.5 py-0.5 text-[11px] font-bold">
                Mitra lokal
              </span>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute -left-3 top-6 -rotate-3 rounded-xl border-2 border-ink-900 bg-white px-3 py-2 shadow-gd"
          >
            <p className="text-[9px] font-bold uppercase tracking-wide text-ink-500">
              Setiap hari
            </p>
            <p className="text-xs font-extrabold">Order sekitar kota</p>
          </div>
        </div>
      </div>
    </section>
  );
}
