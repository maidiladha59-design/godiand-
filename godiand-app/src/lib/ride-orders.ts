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
  distanceKm: number;
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

  if (/could not find the function|schema cache/i.test(text)) {
    return new Error("Layanan pesanan belum aktif di server. Coba lagi nanti.");
  }

  if (/row-level security|permission denied/i.test(text)) {
    return new Error("Kamu belum bisa memesan. Coba masuk ulang ya.");
  }

  if (/jwt/i.test(text)) {
    return new Error("Sesi kamu sudah berakhir. Masuk ulang ya.");
  }

  return new Error(text || fallback);
}

export async function fetchRideFare(distanceKm: number): Promise<number> {
  const client = requireClient();

  const { data, error } = await client.rpc("calculate_fare", {
    p_service_type: "ride",
    p_distance_km: distanceKm,
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

  const { data, error } = await client.rpc("create_ride_order", {
    p_pickup_address: input.pickupAddress,
    p_dropoff_address: input.dropoffAddress,
    p_pickup_latitude: input.pickup.latitude,
    p_pickup_longitude: input.pickup.longitude,
    p_dropoff_latitude: input.dropoff.latitude,
    p_dropoff_longitude: input.dropoff.longitude,
    p_distance_km: input.distanceKm,
    p_payment_method: input.paymentMethod,
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
