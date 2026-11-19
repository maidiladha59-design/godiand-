import type { MerchantCategory, ServiceType } from "./database.types";

export type ServiceInfo = {
  key: ServiceType;
  label: string;
  tagline: string;
  description: string;
  merchantCategory: MerchantCategory | null;
  monogram: string;
  accent: "brand" | "sun" | "coral" | "mint" | "grape" | "mist";
};

export const services: ServiceInfo[] = [
  {
    key: "ride",
    label: "Ojek",
    tagline: "Cepat ke tujuan.",
    description: "Diantar driver motor ke titik yang kamu pilih.",
    merchantCategory: null,
    monogram: "O",
    accent: "brand",
  },
  {
    key: "send",
    label: "Antar",
    tagline: "Barang sampai, kamu tenang.",
    description: "Kirim paket atau dokumen ke titik tujuan.",
    merchantCategory: null,
    monogram: "A",
    accent: "sun",
  },
  {
    key: "food",
    label: "Makan",
    tagline: "Lapar? Pesan sekarang.",
    description: "Pesan makanan dari toko yang aktif di Godiand.",
    merchantCategory: "makanan",
    monogram: "M",
    accent: "coral",
  },
  {
    key: "laundry",
    label: "Laundry",
    tagline: "Cucian dijemput, balik bersih.",
    description: "Driver menjemput cucian ke toko laundry.",
    merchantCategory: "laundry",
    monogram: "L",
    accent: "mint",
  },
  {
    key: "titip",
    label: "Titip",
    tagline: "Ada yang perlu dibelikan?",
    description: "Titip beli atau urus sesuatu lewat driver.",
    merchantCategory: null,
    monogram: "T",
    accent: "grape",
  },
  {
    key: "mart",
    label: "Mart",
    tagline: "Belanja kebutuhan harian.",
    description: "Belanja dari toko mart yang aktif di Godiand.",
    merchantCategory: "mart",
    monogram: "B",
    accent: "mist",
  },
];

export function getService(key: string | undefined): ServiceInfo | null {
  return services.find((service) => service.key === key) ?? null;
}

export function serviceLabel(key: ServiceType | string): string {
  return services.find((service) => service.key === key)?.label ?? "Layanan";
}
