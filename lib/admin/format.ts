import type {
  OrderStatus,
  PaymentRow,
  ServiceType,
  SosReportRow,
} from "@/lib/supabase/database.types";

const serviceLabels: Record<ServiceType, string> = {
  ride: "Ojek",
  send: "Antar",
  food: "Makan",
  laundry: "Laundry",
  titip: "Titip",
  mart: "Mart",
};

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Menunggu",
  accepted: "Diterima",
  in_progress: "Berjalan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const paymentStatusLabels: Record<PaymentRow["status"], string> = {
  pending: "Belum bayar",
  paid: "Lunas",
  failed: "Gagal",
  refunded: "Dikembalikan",
};

const sosStatusLabels: Record<SosReportRow["status"], string> = {
  open: "Baru",
  acknowledged: "Ditangani",
  resolved: "Selesai",
};

export function serviceLabel(value: string): string {
  return serviceLabels[value as ServiceType] ?? "Layanan";
}

export function orderStatusLabel(value: string): string {
  return orderStatusLabels[value as OrderStatus] ?? value;
}

export function paymentStatusLabel(value: string): string {
  return paymentStatusLabels[value as PaymentRow["status"]] ?? value;
}

export function sosStatusLabel(value: string): string {
  return sosStatusLabels[value as SosReportRow["status"]] ?? value;
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(value: string | null): string {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDate(value: string | null): string {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}

export function shortId(value: string): string {
  return value.slice(0, 8);
}

export function vehicleLabel(value: "motor" | "mobil"): string {
  return value === "motor" ? "Motor" : "Mobil";
}

export function merchantCategoryLabel(value: "makanan" | "mart" | "laundry") {
  if (value === "makanan") return "Makanan";
  if (value === "mart") return "Mart";
  return "Laundry";
}

export type AdminTone = "brand" | "sun" | "mint" | "coral" | "neutral" | "grape";

export function orderStatusTone(value: string): AdminTone {
  if (value === "pending") return "sun";
  if (value === "accepted" || value === "in_progress") return "brand";
  if (value === "completed") return "mint";
  if (value === "cancelled") return "coral";
  return "neutral";
}

export function paymentStatusTone(value: string): AdminTone {
  if (value === "pending") return "sun";
  if (value === "paid") return "mint";
  if (value === "failed") return "coral";
  if (value === "refunded") return "grape";
  return "neutral";
}

export function sosStatusTone(value: string): AdminTone {
  if (value === "open") return "coral";
  if (value === "acknowledged") return "sun";
  if (value === "resolved") return "mint";
  return "neutral";
}
