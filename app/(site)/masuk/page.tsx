import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { Icon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Masuk atau daftar",
  description:
    "Masuk ke GoDiand pakai kode 6 digit yang dikirim ke email. Tanpa password.",
  alternates: { canonical: "/masuk" },
  robots: { index: false, follow: false },
};

const steps = [
  "Masukkan email.",
  "Buka kode 6 digit di email.",
  "Masukkan kode. Selesai.",
];

export default function MasukPage() {
  return (
    <>
      <PageHero
        label="Akun"
        title="Masuk atau daftar"
        description="Cukup email dan kode 6 digit. Tanpa password, tanpa ribet."
        meta="Nomor HP opsional dan tidak diverifikasi."
      />

      <section className="gd-container max-w-5xl py-14 sm:py-20">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <LoginForm />

          <aside className="gd-card bg-brand-950 p-6 text-white">
            <span className="gd-label">Aman & singkat</span>
            <h2 className="mt-4 text-xl font-extrabold tracking-tight">
              Masuk tanpa password
            </h2>
            <ol className="mt-5 space-y-4">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-white/70 bg-sun-400 text-xs font-extrabold text-ink-900">
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-sm font-semibold leading-relaxed text-brand-100">
                    {step}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-xl border-2 border-white/20 bg-white/10 p-3.5">
              <p className="flex gap-2 text-xs font-semibold leading-relaxed text-brand-100">
                <Icon
                  name="shield"
                  size={16}
                  className="mt-0.5 shrink-0 text-sun-400"
                />
                Nomor HP cuma buat dihubungi driver. Tidak ada verifikasi SMS.
              </p>
            </div>

            <p className="mt-4 text-xs font-semibold leading-relaxed text-brand-200">
              Cek folder spam kalau kode belum muncul. Kamu bisa kirim ulang
              setelah 60 detik.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
