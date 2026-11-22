import { Icon } from "./icons";
import { Logo } from "./Logo";

/**
 * Ilustrasi mockup aplikasi untuk hero.
 * Seluruh isi mockup bersifat dekoratif dan ditandai aria-hidden.
 */
export function PhoneMockup() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-[264px] px-2 text-ink-900 sm:w-[304px]"
    >
      <div
        aria-hidden="true"
        className="absolute -left-4 -top-8 h-28 w-28 rounded-full bg-sun-300/70"
      />
      <div
        aria-hidden="true"
        className="absolute -right-6 bottom-8 h-40 w-40 rounded-full bg-brand-300/40"
      />

      <div className="gd-float relative rounded-[2.6rem] border-[3px] border-ink-900 bg-ink-900 p-2 shadow-gd-lg">
        <div className="overflow-hidden rounded-[2.1rem] bg-white">
          <div className="flex items-center justify-between px-4 pb-1 pt-3 text-[9px] font-extrabold text-ink-700">
            <span>09.41</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-ink-900" />
              <span className="h-1.5 w-1.5 rounded-full bg-ink-900" />
              <span className="h-2.5 w-4 rounded-sm border border-ink-900" />
            </span>
          </div>

          <div className="flex items-center justify-between px-4 py-2">
            <span className="flex items-center gap-1.5">
              <Logo size={20} />
              <span className="text-sm font-extrabold">GoDiand</span>
            </span>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-100 text-[9px] font-extrabold text-brand-700">
              FA
            </span>
          </div>

          <div className="relative h-44 overflow-hidden bg-[#e4f1f8]">
            <svg
              viewBox="0 0 280 180"
              className="absolute inset-0 h-full w-full"
            >
              <rect width="280" height="180" fill="#e4f1f8" />
              <path
                d="M-10 42h300M-10 112h300M62-10v200M192-10v200"
                stroke="#c9e3f0"
                strokeWidth="8"
              />
              <path
                d="M-10 76h300M132-10v200"
                stroke="#ffffff"
                strokeWidth="10"
              />
              <path
                d="M186 142c-25-20-25-46-55-61S96 46 89 26"
                fill="none"
                stroke="#0a78b5"
                strokeWidth="4"
                strokeDasharray="7 6"
                strokeLinecap="round"
              />
              <circle
                cx="186"
                cy="142"
                r="6"
                fill="#0a78b5"
                stroke="#0b1c26"
                strokeWidth="2"
              />
              <circle
                cx="89"
                cy="26"
                r="7"
                fill="#ffc531"
                stroke="#0b1c26"
                strokeWidth="2"
              />
            </svg>
            <span className="absolute bottom-3 left-3 rounded-full border border-ink-900 bg-white px-2 py-0.5 text-[8px] font-extrabold">
              Kamu
            </span>
            <span className="absolute left-3 top-3 rounded-full border border-ink-900 bg-white px-2 py-0.5 text-[8px] font-extrabold">
              Masjid Raya
            </span>
          </div>

          <div className="relative -mt-5 space-y-2.5 rounded-t-2xl bg-white p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-ink-500">
                GoDiandRide
              </span>
              <span className="rounded-full bg-mint-50 px-2 py-0.5 text-[8px] font-bold text-mint-700">
                Driver dekat
              </span>
            </div>
            <div>
              <p className="text-[13px] font-extrabold">
                Masjid Raya Baiturrahman
              </p>
              <p className="text-[9px] text-ink-500">2,8 km · sekitar 9 menit</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border-2 border-ink-900 bg-sun-50 px-2.5 py-1.5">
              <span className="text-[9px] font-bold text-ink-600">Tarif</span>
              <span className="text-sm font-extrabold">Rp 12.000</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-mist px-2.5 py-1.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-[9px] font-extrabold text-brand-700">
                F
              </span>
              <span>
                <span className="block text-[10px] font-extrabold">
                  Fauzan · 4,9
                </span>
                <span className="block text-[8px] text-ink-500">
                  Honda Vario · BL 1234 XX
                </span>
              </span>
              <span className="ml-auto grid h-6 w-6 place-items-center rounded-md border border-ink-900 text-ink-700">
                <Icon name="chat" size={12} />
              </span>
            </div>
            <div className="flex gap-2 pb-1">
              <span className="flex-1 rounded-lg bg-brand-600 py-1.5 text-center text-[10px] font-extrabold text-white">
                Pesan
              </span>
              <span className="grid h-7 w-8 place-items-center rounded-lg border-2 border-ink-900 text-[7px] font-extrabold text-coral-600">
                SOS
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute -left-8 top-24 hidden w-36 -rotate-3 rounded-xl border-2 border-ink-900 bg-white p-2.5 shadow-gd sm:block"
      >
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-sun-100 text-ink-900">
            <Icon name="receipt" size={14} />
          </span>
          <p className="text-[10px] font-extrabold leading-tight">
            Tarif duluan,
            <br />
            tanpa tawar
          </p>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute -right-7 bottom-24 hidden rotate-3 rounded-xl border-2 border-ink-900 bg-brand-600 px-3 py-2 text-white shadow-gd sm:block"
      >
        <p className="text-[8px] font-bold uppercase tracking-wide text-brand-100">
          Bayar ke driver
        </p>
        <p className="text-xs font-extrabold">Tunai / QRIS</p>
      </div>
    </div>
  );
}
