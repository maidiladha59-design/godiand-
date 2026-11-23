import type { Coordinates } from "./geo";
import { supabase } from "./supabase";

export type PaymentMethod = "cash" | "qris";

export type RideOrderStatus =
  | "mencari_driver"
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export type RideOrder = {
  id: string;
  status: RideOrderStatus;
  pickup_address: string | null;
  dropoff_address: string | null;
  distance_km: number;
  delivery_fee: number;
  total_amount: number;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  dropoff_latitude: number | null;
  dropoff_longitude: number | null;
  created_at: string;
  payment_method: PaymentMethod | null;
};

export type NewRideOrderInput = {
  pickupAddress: string;
  pickup: Coordinates;
  dropoffAddress: string;
  dropoff: Coordinates;
  paymentMethod: PaymentMethod;
};

export type RideOrderSummary = Omit<RideOrder, "payment_method">;

type RideOrderRow = Omit<RideOrder, "payment_method">;

const ORDER_COLUMNS = [
  "id",
  "status",
  "pickup_address",
  "dropoff_address",
  "distance_km",
  "delivery_fee",
  "total_amount",
  "pickup_latitude",
  "pickup_longitude",
  "dropoff_latitude",
  "dropoff_longitude",
  "created_at",
].join(", ");

export const activeRideStatuses: RideOrderStatus[] = [
  "mencari_driver",
  "pending",
  "accepted",
];

export function isActiveRideStatus(status: RideOrderStatus): boolean {
  return activeRideStatuses.includes(status);
}

const runningRideStatuses: RideOrderStatus[] = [
  ...activeRideStatuses,
  "in_progress",
];

export function isRunningRideStatus(status: RideOrderStatus): boolean {
  return runningRideStatuses.includes(status);
}

export const rideStatusLabel: Record<RideOrderStatus, string> = {
  mencari_driver: "Mencari driver",
  pending: "Mencari driver",
  accepted: "Driver menuju lokasi",
  in_progress: "Dalam perjalanan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export function paymentMethodLabel(method: PaymentMethod): string {
  return method === "qris" ? "QRIS" : "Tunai";
}

function requireClient() {
  if (!supabase) {
    throw new Error("Supabase belum diatur. Hubungi admin GoDiand.");
  }
  return supabase;
}

function toFriendlyError(message: string | undefined, fallback: string): Error {
  const text = message ?? "";

  if (
    /could not find the function|schema cache|column .+ does not exist/i.test(
      text,
    )
  ) {
    return new Error("Layanan pesanan belum aktif di server. Coba lagi nanti.");
  }

  if (/row-level security|permission denied/i.test(text)) {
    return new Error("Kamu belum bisa memesan. Coba masuk ulang ya.");
  }

  if (/jwt/i.test(text)) {
    return new Error("Sesi kamu sudah berakhir. Masuk ulang ya.");
  }

  if (
    /network request failed|failed to fetch|fetch failed|load failed|timed? ?out|timeout/i.test(
      text,
    )
  ) {
    return new Error(
      "Jaringan lagi bermasalah. Cek koneksi internet lalu coba lagi ya.",
    );
  }

  return new Error(text || fallback);
}

export async function fetchRideFare(distanceKm: number): Promise<number> {
  const client = requireClient();

  const { data, error } = await client.rpc("hitung_tarif", {
    p_layanan: "ride",
    p_jarak_km: distanceKm,
  });

  if (error) {
    throw toFriendlyError(error.message, "Tarif belum bisa dihitung.");
  }

  const fare = Number(data);

  if (!Number.isFinite(fare) || fare <= 0) {
    throw new Error("Tarif belum bisa dihitung. Coba lagi ya.");
  }

  return fare;
}

export async function createRideOrder(
  input: NewRideOrderInput,
): Promise<RideOrder> {
  const client = requireClient();

  const { data, error } = await client.rpc("buat_pesanan", {
    p_layanan: "ride",
    p_jemput_nama: input.pickupAddress,
    p_jemput_lat: input.pickup.latitude,
    p_jemput_lng: input.pickup.longitude,
    p_tujuan_nama: input.dropoffAddress,
    p_tujuan_lat: input.dropoff.latitude,
    p_tujuan_lng: input.dropoff.longitude,
    p_metode_bayar: input.paymentMethod === "cash" ? "tunai" : "qris",
  });

  if (error) {
    throw toFriendlyError(error.message, "Pesanan belum bisa dibuat.");
  }

  const row = data as RideOrderRow;

  return { ...row, payment_method: input.paymentMethod };
}

export async function fetchRideOrder(orderId: string): Promise<RideOrder> {
  const client = requireClient();

  const { data, error } = await client
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("id", orderId)
    .single();

  if (error) {
    throw toFriendlyError(error.message, "Pesanan belum bisa dimuat.");
  }

  const row = data as unknown as RideOrderRow;

  const { data: payment } = await client
    .from("payments")
    .select("method")
    .eq("order_id", orderId)
    .maybeSingle();

  const method = (payment as unknown as { method: string } | null)?.method;

  return {
    ...row,
    payment_method: method === "cash" || method === "qris" ? method : null,
  };
}

export async function fetchMyRideOrders(): Promise<RideOrderSummary[]> {
  const client = requireClient();

  const { data, error } = await client
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("service_type", "ride")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw toFriendlyError(error.message, "Riwayat belum bisa dimuat.");
  }

  return (data as unknown as RideOrderSummary[] | null) ?? [];
}

export async function cancelRideOrder(orderId: string): Promise<void> {
  const client = requireClient();

  const { error } = await client.rpc("cancel_order", {
    p_order_id: orderId,
    p_reason: "Dibatalkan dari aplikasi pelanggan",
  });

  if (error) {
    throw toFriendlyError(error.message, "Pesanan belum bisa dibatalkan.");
  }
}
