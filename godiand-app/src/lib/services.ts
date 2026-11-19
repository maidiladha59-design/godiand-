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
    label: "GoDiandRide",
    tagline: "Cepat ke tujuan.",
    monogram: "R",
    accent: "brand",
    comingSoon: false,
  },
  {
    key: "send",
    label: "GoDiandSend",
    tagline: "Barang sampai, kamu tenang.",
    monogram: "S",
    accent: "sun",
    comingSoon: true,
  },
  {
    key: "food",
    label: "GoDiandFood",
    tagline: "Lapar? Pesan makanan.",
    monogram: "F",
    accent: "coral",
    comingSoon: true,
  },
  {
    key: "laundry",
    label: "GoDiandLaundry",
    tagline: "Cucian dijemput, balik bersih.",
    monogram: "L",
    accent: "mint",
    comingSoon: true,
  },
  {
    key: "titip",
    label: "GoDiandTitip",
    tagline: "Titip beli atau urus sesuatu.",
    monogram: "T",
    accent: "grape",
    comingSoon: true,
  },
  {
    key: "mart",
    label: "GoDiandMart",
    tagline: "Belanja kebutuhan harian.",
    monogram: "M",
    accent: "mist",
    comingSoon: true,
  },
];
