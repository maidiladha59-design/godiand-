import Link from "next/link";
import { site, waLink } from "@/lib/site";
import { Icon } from "./icons";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t-2 border-ink-900 bg-ink-900 text-white">
      <div className="gd-container py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              {site.tagline}
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-sun-400">
              <Icon name="pin" size={14} />
              Banda Aceh, Aceh
            </p>
          </div>

          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/50">
              Kontak
            </h2>
            <ul className="mt-4 space-y-3 text-sm font-semibold">
              <li>
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-sun-400"
                >
                  <Icon name="whatsapp" size={17} />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-sun-400"
                >
                  <Icon name="instagram" size={17} />
                  Instagram
                </a>
              </li>
              <li>
                <Link
                  href="/unduh"
                  className="inline-flex items-center gap-2 transition-colors hover:text-sun-400"
                >
                  <Icon name="download" size={17} />
                  Unduh aplikasi
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/50">
              Legal
            </h2>
            <ul className="mt-4 space-y-3 text-sm font-semibold">
              <li>
                <Link
                  href="/privasi"
                  className="transition-colors hover:text-sun-400"
                >
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link
                  href="/syarat"
                  className="transition-colors hover:text-sun-400"
                >
                  Syarat Layanan
                </Link>
              </li>
              <li>
                <Link
                  href="/hapus-akun"
                  className="transition-colors hover:text-sun-400"
                >
                  Hapus akun
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/15 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 GoDiand. Semua hak dilindungi.</p>
          <p>Versi awal: aplikasi segera hadir.</p>
        </div>
      </div>
    </footer>
  );
}
