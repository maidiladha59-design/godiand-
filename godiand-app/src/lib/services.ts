export type ServiceAccent = "brand" | "sun" | "coral" | "mint" | "grape" | "mist";

export type ServiceIcon =
  | "bicycle"
  | "cube"
  | "shirt"
  | "fast-food"
  | "bag-handle"
  | "cart";

export type ServiceInfo = {
  key: string;
  label: string;
  tagline: string;
  icon: ServiceIcon;
  accent: ServiceAccent;
  comingSoon: boolean;
};

export const services: ServiceInfo[] = [
  {
    key: "ride",
    label: "GoDiandRide",
    tagline: "Cepat ke tujuan.",
    icon: "bicycle",
    accent: "brand",
    comingSoon: false,
  },
  {
    key: "send",
    label: "GoDiandSend",
    tagline: "Barang sampai, kamu tenang.",
    icon: "cube",
    accent: "sun",
    comingSoon: true,
  },
  {
    key: "laundry",
    label: "GoDiandLaundry",
    tagline: "Cucian dijemput, balik bersih.",
    icon: "shirt",
    accent: "mint",
    comingSoon: true,
  },
  {
    key: "food",
    label: "GoDiandFood",
    tagline: "Lapar? Pesan makanan.",
    icon: "fast-food",
    accent: "coral",
    comingSoon: true,
  },
  {
    key: "titip",
    label: "GoDiandTitip",
    tagline: "Titip beli atau urus sesuatu.",
    icon: "bag-handle",
    accent: "grape",
    comingSoon: true,
  },
  {
    key: "mart",
    label: "GoDiandMart",
    tagline: "Belanja kebutuhan harian.",
    icon: "cart",
    accent: "mist",
    comingSoon: true,
  },
];
