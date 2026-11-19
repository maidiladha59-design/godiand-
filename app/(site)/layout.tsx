import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ScrollReveal } from "@/components/scroll-reveal";
import { StructuredData } from "@/components/structured-data";
import { site } from "@/lib/site";

// Metadata ber-url sengaja di sini, bukan di layout root: metadata yang memuat
// url/canonical membuat Next menunggu pathname, sehingga rute dinamis admin
// gagal diprerender.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: site.name,
    title: `${site.name} — Ojek, Antar, Makan di Banda Aceh`,
    description: site.description,
  },
};

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:border-2 focus:border-ink-900 focus:bg-white focus:px-4 focus:py-2 focus:font-bold"
      >
        Lewati ke konten
      </a>
      <StructuredData />
      <Navbar />
      <main id="konten" className="flex-1">
        {children}
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
