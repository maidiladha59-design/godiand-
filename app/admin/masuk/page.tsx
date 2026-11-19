import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Masuk admin",
  description: "Masuk ke panel operasional Godiand.",
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          aria-label="Godiand, kembali ke situs"
          className="mx-auto mb-6 flex w-fit"
        >
          <Logo />
        </Link>

        <AdminLoginForm />

        <p className="mt-5 text-center text-xs font-semibold leading-relaxed text-ink-500">
          Halaman khusus tim Godiand.{" "}
          <Link
            href="/"
            className="font-extrabold text-brand-700 underline underline-offset-4"
          >
            Kembali ke situs
          </Link>
        </p>
      </div>
    </main>
  );
}
