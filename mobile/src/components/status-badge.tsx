import { Badge, type BadgeTone } from "@/components/ui";
import type { OrderStatus } from "@/lib/database.types";

const statusMeta: Record<
  OrderStatus,
  { label: string; tone: BadgeTone; note: string }
> = {
  pending: {
    label: "Menunggu",
    tone: "sun",
    note: "Menunggu driver menerima pesanan.",
  },
  accepted: {
    label: "Diterima",
    tone: "brand",
    note: "Driver sudah menerima pesananmu.",
  },
  in_progress: {
    label: "Berjalan",
    tone: "brand",
    note: "Pesanan sedang berjalan.",
  },
  completed: {
    label: "Selesai",
    tone: "mint",
    note: "Pesanan selesai. Terima kasih ya.",
  },
  cancelled: {
    label: "Dibatalkan",
    tone: "coral",
    note: "Pesanan dibatalkan.",
  },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = statusMeta[status];

  return <Badge label={meta.label} tone={meta.tone} />;
}

export function statusNote(status: OrderStatus): string {
  return statusMeta[status].note;
}

export function isActiveStatus(status: OrderStatus): boolean {
  return status === "pending" || status === "accepted" || status === "in_progress";
}
