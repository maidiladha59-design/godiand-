import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { site } from "@/lib/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const defaultTitle = `${site.name} — Ojek, Antar, Makan di Banda Aceh`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: defaultTitle,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "ojek Banda Aceh",
    "antar barang Banda Aceh",
    "pesan makanan Banda Aceh",
    "laundry Banda Aceh",
    "titip beli Banda Aceh",
    "belanja online Banda Aceh",
    "Godiand",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  category: "transportation",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: site.description,
  },
  manifest: "/manifest.webmanifest",
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A78B5",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-mist font-sans text-ink-900">
        {children}
      </body>
    </html>
  );
}
