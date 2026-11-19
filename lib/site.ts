/**
 * Konfigurasi situs GoDiand.
 * Ganti nomor WhatsApp, Instagram, dan URL sebelum situs dipublikasikan.
 */
export const site = {
  name: "GoDiand",
  city: "Banda Aceh",
  tagline: "Ojek, antar, makan. Semua sat-set di Banda Aceh.",
  description:
    "Ojek, antar barang, makanan, laundry, titip beli, dan belanja dari driver lokal Banda Aceh. Tarif tampil sebelum memesan, bayar tunai atau QRIS langsung ke driver, ada chat dan tombol SOS.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://godiand.example",
  whatsapp: "6285834043432",
  whatsappDisplay: "0858-3404-3432",
  instagram: "https://www.instagram.com/xaidiladha_zhx",
  instagramHandle: "@xaidiladha_zhx",
} as const;

export const defaultWhatsAppMessage = "Halo GoDiand, saya mau tanya.";

export function waLink(message: string = defaultWhatsAppMessage): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}
