import Image from "next/image";
import { StoreBadges } from "./store-badges";

const apps = [
  {
    name: "Godiand",
    audience: "Untuk pelanggan",
    description:
      "Pesan Ride, Send, Food, Laundry, Titip, dan Mart. Tarif kelihatan sebelum pesan, lalu bayar tunai atau QRIS ke driver.",
    icon: "/logo.png",
    iconAlt: "Godiand",
    tint: "bg-brand-50",
  },
  {
    name: "Godiand Driver",
    audience: "Untuk mitra driver",
    description:
      "Atur status aktif, terima pesanan sekitar Banda Aceh, konfirmasi pembayaran, dan pantau penghasilan harian.",
    icon: "/logo-driver.png",
    iconAlt: "Godiand Driver",
    tint: "bg-sun-50",
  },
];

export function DownloadCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {apps.map((app) => (
        <article
          key={app.name}
          data-reveal
          className="gd-card gd-lift flex h-full flex-col p-6 sm:p-7"
        >
          <div className="flex items-start gap-4">
            <span
              className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-2 border-ink-900 ${app.tint}`}
            >
              <Image
                src={app.icon}
                alt={app.iconAlt}
                width={96}
                height={96}
                className="h-12 w-12"
              />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-500">
                {app.audience}
              </p>
              <h3 className="mt-1 text-2xl font-extrabold">{app.name}</h3>
            </div>
          </div>
          <p className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-600">
            {app.description}
          </p>
          <StoreBadges className="mt-6" />
          <p className="mt-4 text-xs font-semibold text-ink-500">
            Gratis. Tanpa saldo, tanpa top-up.
          </p>
        </article>
      ))}
    </div>
  );
}
