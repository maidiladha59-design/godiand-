"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/logo";

const navigation = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/driver", label: "Driver" },
  { href: "/admin/merchant", label: "Merchant" },
  { href: "/admin/pesanan", label: "Pesanan" },
  { href: "/admin/sos", label: "SOS" },
  { href: "/admin/pembayaran", label: "Pembayaran" },
  { href: "/admin/tarif", label: "Tarif" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  children,
  email,
  name,
  role,
  onSignOut,
}: {
  children: ReactNode;
  email: string;
  name: string | null;
  role: "admin" | "operator" | null;
  onSignOut: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    await onSignOut();
  }

  return (
    <div className="min-h-screen bg-mist lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="hidden border-r-2 border-ink-900 bg-white lg:flex lg:h-screen lg:flex-col lg:sticky lg:top-0">
        <div className="border-b-2 border-ink-900 px-5 py-5">
          <Link href="/admin" aria-label="GoDiand Admin, ke ringkasan">
            <Logo />
          </Link>
          <p className="mt-2 inline-block rounded-md border-2 border-ink-900 bg-sun-400 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.16em]">
            Panel admin
          </p>
        </div>

        <nav aria-label="Navigasi admin" className="flex-1 space-y-1 p-3">
          {navigation.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block rounded-xl border-2 px-3 py-2.5 text-sm font-extrabold transition ${
                  active
                    ? "border-ink-900 bg-brand-600 text-white shadow-gd"
                    : "border-transparent text-ink-700 hover:border-ink-900 hover:bg-mist"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t-2 border-ink-900 p-4">
          <p className="text-sm font-extrabold">{name ?? "Admin GoDiand"}</p>
          <p className="mt-0.5 break-all text-xs font-semibold text-ink-500">
            {email}
          </p>
          <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-700">
            {role === "operator" ? "Operator" : "Admin"}
          </p>
          <Link
            href="/"
            className="mt-3 inline-block text-xs font-extrabold text-ink-600 underline underline-offset-4"
          >
            Lihat situs
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-3 w-full rounded-xl border-2 border-ink-900 bg-white px-3 py-2 text-sm font-extrabold hover:bg-coral-50 disabled:opacity-60"
          >
            {signingOut ? "Keluar..." : "Keluar"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="border-b-2 border-ink-900 bg-white lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <Link href="/admin" aria-label="GoDiand Admin, ke ringkasan">
              <Logo />
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="rounded-xl border-2 border-ink-900 bg-white px-3 py-2 text-xs font-extrabold disabled:opacity-60"
            >
              {signingOut ? "Keluar..." : "Keluar"}
            </button>
          </div>
          <nav
            aria-label="Navigasi admin"
            className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3"
          >
            {navigation.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 rounded-full border-2 px-3 py-1.5 text-xs font-extrabold ${
                    active
                      ? "border-ink-900 bg-ink-900 text-white"
                      : "border-ink-900 bg-white text-ink-700"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
