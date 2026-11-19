import type { IconName } from "@/components/icons";

export type Service = {
  name: string;
  tag: string;
  description: string;
  icon: IconName;
  tint: string;
  iconColor: string;
};

export const services: Service[] = [
  {
    name: "GodiandRide",
    tag: "Mulai Rp9.000",
    description:
      "Ojek keliling Banda Aceh. Ke Masjid Raya, Museum Tsunami, PLTD Apung, atau santai di Ulee Lheue.",
    icon: "bike",
    tint: "bg-brand-100",
    iconColor: "text-brand-700",
  },
  {
    name: "GodiandSend",
    tag: "Kirim & ambil",
    description:
      "Kirim dokumen atau ambil barang yang ketinggalan. Ada foto serah terima biar semuanya jelas.",
    icon: "package",
    tint: "bg-mint-50",
    iconColor: "text-mint-700",
  },
  {
    name: "GodiandFood",
    tag: "Warung lokal",
    description:
      "Mie Aceh, nasi gurih, martabak, sampai kopi Ulee Kareng. Warung lokal, driver yang antar.",
    icon: "utensils",
    tint: "bg-sun-50",
    iconColor: "text-sun-600",
  },
  {
    name: "GodiandLaundry",
    tag: "Jemput-antar",
    description:
      "Cucian kotor dijemput, lalu diantar balik bersih dan wangi. Cocok buat anak kos dan pekerja sibuk.",
    icon: "washer",
    tint: "bg-grape-50",
    iconColor: "text-grape-700",
  },
  {
    name: "GodiandTitip",
    tag: "Titip beli",
    description:
      "Titip beli dari pasar atau toko? Driver yang cari, belanja, lalu antar ke tanganmu.",
    icon: "bag",
    tint: "bg-coral-50",
    iconColor: "text-coral-700",
  },
  {
    name: "GodiandMart",
    tag: "Belanja kilat",
    description:
      "Belanja kebutuhan dari Indomaret atau Alfamart. Dibeli, dibayar, langsung diantar.",
    icon: "store",
    tint: "bg-mint-50",
    iconColor: "text-mint-700",
  },
];

export type Place = {
  name: string;
  note: string;
  image: string;
  alt: string;
};

export const places: Place[] = [
  {
    name: "Masjid Raya Baiturrahman",
    note: "Ikon kota yang wajib dilihat. Dekat dari mana-mana.",
    image: "/places/baiturrahman.jpg",
    alt: "Masjid Raya Baiturrahman dengan menara dan kubah saat matahari terbenam",
  },
  {
    name: "Museum Tsunami",
    note: "Belajar sejarah dengan tenang. Driver antre di luar.",
    image: "/places/museum-tsunami.jpg",
    alt: "Bangunan Museum Tsunami Aceh dilihat dari udara",
  },
  {
    name: "PLTD Apung",
    note: "Kapal raksasa di tengah kota. Sekali lihat, nggak lupa.",
    image: "/places/pltd-apung.jpg",
    alt: "Kapal PLTD Apung 1 di Banda Aceh",
  },
  {
    name: "Pantai Ulee Lheue",
    note: "Cari angin laut sore-sore. Bawa keluarga, berangkat bareng.",
    image: "/places/ulee-lheue.jpg",
    alt: "Pantai Ulee Lheue dengan kapal feri dan dermaga",
  },
];

export type Feature = {
  title: string;
  description: string;
  icon: IconName;
  tint: string;
};

export const features: Feature[] = [
  {
    title: "Tarif tampil duluan",
    description:
      "Harga sudah kelihatan sebelum pesan. Nggak ada tawar-menawar di jalan.",
    icon: "receipt",
    tint: "bg-sun-50",
  },
  {
    title: "Tunai atau QRIS",
    description:
      "Bayar langsung ke driver pas sampai. Tanpa saldo, tanpa top-up.",
    icon: "wallet",
    tint: "bg-mint-50",
  },
  {
    title: "Chat & tombol SOS",
    description:
      "Tanya driver lewat chat. Kalau darurat, tombol SOS tinggal tekan.",
    icon: "shield",
    tint: "bg-coral-50",
  },
  {
    title: "Driver warga Banda Aceh",
    description:
      "Yang antar kamu orang sini. Hafal jalan, warung, dan jam macet.",
    icon: "pin",
    tint: "bg-brand-50",
  },
];

export const steps = [
  {
    title: "Pilih layanan",
    description: "Ojek, kirim, makan, laundry, titip, atau belanja.",
  },
  {
    title: "Cek tarif, lalu pesan",
    description: "Isi titik jemput dan tujuan. Tarif langsung muncul.",
  },
  {
    title: "Driver datang",
    description: "Pantau di peta, chat, lalu bayar tunai atau QRIS.",
  },
];

export const infoChips: { label: string; icon: IconName }[] = [
  { label: "Mulai Rp9.000", icon: "wallet" },
  { label: "Tunai / QRIS", icon: "qr" },
  { label: "Ada tombol SOS", icon: "shield" },
  { label: "6 layanan", icon: "grid" },
];
