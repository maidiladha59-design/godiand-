import { Badge, type BadgeTone } from "@/components/ui";
import type { OrderStatus } from "@/lib/database.types";

const statusMeta: Record<
  OrderStatus,
  { label: string; tone: BadgeTone; note: string }
> = {
  mencari_driver: {
    label: "Pesanan baru",
    tone: "sun",
    note: "Pelanggan baru pesan. Ambil sebelum driver lain.",
  },
  pending: {
    label: "Menunggu",
    tone: "sun",
    note: "Pesanan belum kamu ambil.",
  },
  accepted: {
    label: "Diterima",
    tone: "brand",
    note: "Kamu sudah mengambil pesanan ini. Segera menuju titik jemput.",
  },
  in_progress: {
    label: "Berjalan",
    tone: "brand",
    note: "Pesanan sedang berjalan. Selesaikan setelah tiba di tujuan.",
  },
  completed: {
    label: "Selesai",
    tone: "mint",
    note: "Pesanan sudah selesai.",
  },
  cancelled: {
    label: "Dibatalkan",
    tone: "coral",
    note: "Pesanan ini dibatalkan.",
  },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = statusMeta[status];

  return <Badge label={meta.label} tone={meta.tone} />;
}

export function statusNote(status: OrderStatus): string {
  return statusMeta[status].note;
}

export function isDriverActiveStatus(status: OrderStatus): boolean {
  return status === "accepted" || status === "in_progress";
}
