import type { Metadata } from "next";
import { DownloadSection } from "@/components/sections/download";
import { Hero } from "@/components/sections/hero";
import { How } from "@/components/sections/how";
import { InfoChips } from "@/components/sections/info-chips";
import { Partner } from "@/components/sections/partner";
import { Places } from "@/components/sections/places";
import { Services } from "@/components/sections/services";
import { Ticker } from "@/components/sections/ticker";
import { Why } from "@/components/sections/why";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <InfoChips />
      <Services />
      <Places />
      <Why />
      <How />
      <Partner />
      <DownloadSection />
    </>
  );
}
