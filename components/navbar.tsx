"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "./icons";
import { Logo } from "./logo";

const navLinks = [
  { href: "/#layanan", label: "Layanan" },
  { href: "/#cara", label: "Cara pesan" },
  { href: "/#driver", label: "Jadi driver" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink-900 bg-white/90 backdrop-blur">
      <nav
        aria-label="Navigasi utama"
        className="gd-container flex h-16 items-center justify-between gap-3"
      >
        <Link
          href="/"
          aria-label="GoDiand, kembali ke beranda"
          onClick={() => setOpen(false)}
        >
          <Logo preload />
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

        <div className="flex items-center gap-2">
          <Link
            href="/#unduh"
            className="gd-btn gd-btn-sun min-h-10 rounded-xl px-3.5 text-sm"
          >
            Unduh
            <Icon name="arrow-down" size={16} />
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpen((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-xl border-2 border-ink-900 bg-white md:hidden"
          >
            <Icon name={open ? "close" : "menu"} size={22} />
          </button>
        </div>
      </nav>

      {open ? (
        <div
          id="menu-mobile"
          className="border-t-2 border-ink-900 bg-white md:hidden"
        >
          <div className="gd-container flex flex-col py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-ink-900/10 py-3 text-[15px] font-bold text-ink-700 last:border-0 hover:text-brand-700"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/unduh"
              onClick={() => setOpen(false)}
              className="py-3 text-[15px] font-bold text-brand-700"
            >
              Info unduhan
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
