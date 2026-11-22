import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type Promo = {
  key: string;
  tag: string;
  title: string;
  body: string;
  background: string;
  ink: string;
  icon: IconName;
};

export const promos: Promo[] = [
  {
    key: "ngopi",
    tag: "NGOPI",
    title: "Ngopi sore di Ulee Lheue",
    body: "GoDiandRide antar sampai depan kafe. Mulai Rp9.000.",
    background: "#0A78B5",
    ink: "#FFFFFF",
    icon: "cafe",
  },
  {
    key: "mie",
    tag: "KULINER",
    title: "Mie Aceh di Simpang Surabaya",
    body: "Lapar mendadak? Pesan ojek, langsung meluncur.",
    background: "#FDCB4B",
    ink: "#0B1C26",
    icon: "fast-food",
  },
  {
    key: "malam",
    tag: "MALAM",
    title: "Jalan malam, tarif jelas",
    body: "Tarif tampil sebelum pesan. Bayar tunai atau QRIS.",
    background: "#0B1C26",
    ink: "#FFFFFF",
    icon: "moon",
  },
  {
    key: "hujan",
    tag: "HUJAN",
    title: "Hujan di Banda Aceh?",
    body: "Biar GoDiandRide yang basah. Kamu tinggal duduk.",
    background: "#E4552F",
    ink: "#FFFFFF",
    icon: "rainy",
  },
];

export type ExplorePlace = {
  key: string;
  name: string;
  area: string;
  description: string;
  tint: string;
  icon: IconName;
};

export const explorePlaces: ExplorePlace[] = [
  {
    key: "baiturrahman",
    name: "Masjid Raya Baiturrahman",
    area: "Baiturrahman",
    description: "Masjid ikonik dengan kubah putih dan halaman luas.",
    tint: "#DCEFFB",
    icon: "business",
  },
  {
    key: "tsunami",
    name: "Museum Tsunami",
    area: "Banda Aceh",
    description: "Bangunan berlengkung untuk mengenang cerita 2004.",
    tint: "#FFF8E1",
    icon: "library",
  },
  {
    key: "pltd",
    name: "PLTD Apung",
    area: "Jaya Baru",
    description: "Kapal pembangkit raksasa yang terseret ke tengah kota.",
    tint: "#E8F8F2",
    icon: "boat",
  },
  {
    key: "ulee-lheue",
    name: "Pantai Ulee Lheue",
    area: "Meuraxa",
    description: "Cari angin laut sore sambil lihat kapal lewat.",
    tint: "#FFEFE9",
    icon: "sunny",
  },
];
