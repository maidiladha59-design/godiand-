import { apkSizeLabel } from "@/lib/apk";
import { ApkDownloadButton } from "./apk-download-button";
import { Logo } from "./Logo";
import { StoreBadges } from "./store-badges";

const apps = [
  {
    name: "GoDiand untuk Android",
    audience: "Untuk pelanggan",
    description:
      "Pesan Ride, Send, Food, Laundry, Titip, dan Mart. Tarif kelihatan sebelum pesan, lalu bayar tunai atau QRIS ke driver.",
    mark: "pelanggan" as const,
    apk: true,
  },
  {
    name: "GoDiand Driver",
    audience: "Untuk mitra driver",
    description:
      "Atur status aktif, terima pesanan sekitar Banda Aceh, konfirmasi pembayaran, dan pantau penghasilan harian.",
    mark: "driver" as const,
    apk: false,
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
            <Logo mark={app.mark} size={64} />
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
          {app.apk ? (
            <>
              <ApkDownloadButton className="mt-6 w-full" />
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full border-2 border-ink-900 bg-sun-300 px-2.5 py-0.5 text-[11px] font-extrabold text-ink-900">
                  Versi uji coba
                </span>
                <span className="text-xs font-semibold text-ink-500">
                  {apkSizeLabel}
                </span>
              </div>
            </>
          ) : null}
          <StoreBadges className="mt-5" />
          <p className="mt-4 text-xs font-semibold text-ink-500">
            Gratis. Tanpa saldo, tanpa top-up.
          </p>
        </article>
      ))}
    </div>
  );
}
