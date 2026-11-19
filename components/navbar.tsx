import Link from "next/link";
import { Icon } from "./icons";
import { Logo } from "./logo";

const navLinks = [
  { href: "/#layanan", label: "Layanan" },
  { href: "/#cara", label: "Cara pesan" },
  { href: "/#driver", label: "Jadi driver" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink-900 bg-white/90 backdrop-blur">
      <nav
        aria-label="Navigasi utama"
        className="gd-container flex h-[4.5rem] items-center justify-between gap-3"
      >
        <Link href="/" aria-label="GoDiand, kembali ke beranda">
          <Logo preload variant="capsule" />
        </Link>

        <div className="hidden items-center gap-7 text-[15px] font-bold text-ink-700 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/#unduh"
          className="gd-btn gd-btn-sun min-h-10 rounded-xl px-4 text-sm"
        >
          Unduh
          <Icon name="arrow-down" size={16} />
        </Link>
      </nav>
    </header>
  );
}
