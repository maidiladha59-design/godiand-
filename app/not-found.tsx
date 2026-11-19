import Link from "next/link";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-brand-100 px-4 py-20 sm:py-28">
          <div
            aria-hidden="true"
            className="gd-dots absolute inset-0 opacity-60"
          />
          <div className="gd-container relative max-w-2xl">
            <span className="gd-label">404</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Halaman ini tidak ketemu.
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-700">
              Mungkin tautannya salah atau halamannya sudah dipindah. Balik ke
              beranda, yuk.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/" className="gd-btn gd-btn-primary">
                Ke beranda
              </Link>
              <Link
                href="/#layanan"
                className="gd-btn border-ink-900 bg-white text-ink-900"
              >
                Lihat layanan
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
