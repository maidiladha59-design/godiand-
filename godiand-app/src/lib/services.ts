export type ServiceAccent = "brand" | "sun" | "coral" | "mint" | "grape" | "mist";

export type ServiceInfo = {
  key: string;
  label: string;
  tagline: string;
  monogram: string;
  accent: ServiceAccent;
  comingSoon: boolean;
};

export const services: ServiceInfo[] = [
  {
    key: "ride",
    label: "Ride",
    tagline: "Cepat ke tujuan.",
    monogram: "R",
    accent: "brand",
    comingSoon: false,
  },
  {
    key: "send",
    label: "Send",
    tagline: "Barang sampai, kamu tenang.",
    monogram: "S",
    accent: "sun",
    comingSoon: true,
  },
  {
    key: "food",
    label: "Food",
    tagline: "Lapar? Pesan makanan.",
    monogram: "F",
    accent: "coral",
    comingSoon: true,
  },
  {
    key: "laundry",
    label: "Laundry",
    tagline: "Cucian dijemput, balik bersih.",
    monogram: "L",
    accent: "mint",
    comingSoon: true,
  },
  {
    key: "titip",
    label: "Titip",
    tagline: "Titip beli atau urus sesuatu.",
    monogram: "T",
    accent: "grape",
    comingSoon: true,
  },
  {
    key: "mart",
    label: "Mart",
    tagline: "Belanja kebutuhan harian.",
    monogram: "M",
    accent: "mist",
    comingSoon: true,
  },
];
