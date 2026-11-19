import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ScrollReveal } from "@/components/scroll-reveal";
import { StructuredData } from "@/components/structured-data";

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
