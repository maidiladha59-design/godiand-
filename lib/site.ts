/**
 * Konfigurasi situs Godiand.
 * Ganti nomor WhatsApp, Instagram, dan URL sebelum situs dipublikasikan.
 */
export const site = {
  name: "Godiand",
  city: "Banda Aceh",
  tagline: "Ojek, antar, makan. Semua sat-set di Banda Aceh.",
  description:
    "Ojek, antar barang, makanan, laundry, titip beli, dan belanja dari driver lokal Banda Aceh. Tarif tampil sebelum memesan, bayar tunai atau QRIS langsung ke driver, ada chat dan tombol SOS.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://godiand.example",
  whatsapp: "6281234567890",
  whatsappDisplay: "+62 812-3456-7890",
  instagram: "https://www.instagram.com/godiand",
  instagramHandle: "@godiand",
} as const;

export function waLink(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}
