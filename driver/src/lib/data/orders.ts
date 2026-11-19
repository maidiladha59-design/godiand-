import type {
  OrderItemRow,
  OrderRow,
  OrderStatus,
  RatingRow,
  ServiceType,
  SosCategory,
} from "../database.types";
import { supabase } from "../supabase";
import { databaseError } from "./errors";

export type AssignedOrderSummary = Pick<
  OrderRow,
  | "id"
  | "service_type"
  | "status"
  | "created_at"
  | "total_amount"
  | "distance_km"
  | "pickup_address"
  | "dropoff_address"
  | "delivery_fee"
>;

export type AvailableOrder = Pick<
  OrderRow,
  | "id"
  | "service_type"
  | "distance_km"
  | "delivery_fee"
  | "total_amount"
  | "pickup_address"
  | "dropoff_address"
  | "notes"
  | "scheduled_at"
  | "created_at"
>;

export type OrderDetail = Pick<
  OrderRow,
  | "id"
  | "driver_id"
  | "merchant_id"
  | "service_type"
  | "status"
  | "pickup_address"
  | "dropoff_address"
  | "distance_km"
  | "delivery_fee"
  | "items_total"
  | "total_amount"
  | "notes"
  | "scheduled_at"
  | "cancellation_reason"
  | "created_at"
  | "accepted_at"
  | "completed_at"
  | "cancelled_at"
>;

export type OrderItem = Pick<
  OrderItemRow,
  "id" | "name" | "unit_price" | "quantity" | "line_total" | "notes"
>;

export type RatingInfo = Pick<
  RatingRow,
  "id" | "score" | "comment" | "created_at"
>;

export const driverActiveStatuses: OrderStatus[] = [
  "accepted",
  "in_progress",
];

const availableFields =
  "id, service_type, distance_km, delivery_fee, total_amount, pickup_address, dropoff_address, notes, scheduled_at, created_at";

const summaryFields =
  "id, service_type, status, created_at, total_amount, distance_km, pickup_address, dropoff_address, delivery_fee";

const detailFields =
  "id, driver_id, merchant_id, service_type, status, pickup_address, dropoff_address, distance_km, delivery_fee, items_total, total_amount, notes, scheduled_at, cancellation_reason, created_at, accepted_at, completed_at, cancelled_at";

export async function loadAvailableOrders(): Promise<{
  orders: AvailableOrder[];
  error: string | null;
}> {
  if (!supabase) {
    return { orders: [], error: "Supabase belum diatur." };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(availableFields)
    .eq("status", "pending")
    .is("driver_id", null)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return {
      orders: [],
      error: "Pesanan tersedia belum bisa dimuat. Coba lagi ya.",
    };
  }

  return { orders: data ?? [], error: null };
}

export async function loadAssignedOrders(
  driverId: string,
  statuses: OrderStatus[],
): Promise<{ orders: AssignedOrderSummary[]; error: string | null }> {
  if (!supabase) {
    return { orders: [], error: "Supabase belum diatur." };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(summaryFields)
    .eq("driver_id", driverId)
    .in("status", statuses)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return {
      orders: [],
      error: "Pesananmu belum bisa dimuat. Coba lagi ya.",
    };
  }

  return { orders: data ?? [], error: null };
}

export async function loadActiveOrder(
  driverId: string,
): Promise<{ order: AssignedOrderSummary | null; error: string | null }> {
  if (!supabase) {
    return { order: null, error: "Supabase belum diatur." };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(summaryFields)
    .eq("driver_id", driverId)
    .in("status", driverActiveStatuses)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      order: null,
      error: "Pesanan aktif belum bisa dimuat. Coba lagi ya.",
    };
  }

  return { order: data ?? null, error: null };
}

export async function loadOrder(
  orderId: string,
): Promise<{ order: OrderDetail | null; error: string | null }> {
  if (!supabase) {
    return { order: null, error: "Supabase belum diatur." };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(detailFields)
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    return {
      order: null,
      error: "Pesanan belum bisa dimuat. Coba lagi ya.",
    };
  }

  return { order: data ?? null, error: null };
}

export async function loadOrderItems(
  orderId: string,
): Promise<{ items: OrderItem[]; error: string | null }> {
  if (!supabase) {
    return { items: [], error: "Supabase belum diatur." };
  }

  const { data, error } = await supabase
    .from("order_items")
    .select("id, name, unit_price, quantity, line_total, notes")
    .eq("order_id", orderId)
    .order("created_at");

  if (error) {
    return { items: [], error: "Rincian menu belum bisa dimuat." };
  }

  return { items: data ?? [], error: null };
}

export async function loadRating(
  orderId: string,
): Promise<{ rating: RatingInfo | null; error: string | null }> {
  if (!supabase) {
    return { rating: null, error: "Supabase belum diatur." };
  }

  const { data, error } = await supabase
    .from("ratings")
    .select("id, score, comment, created_at")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) {
    return { rating: null, error: "Penilaian belum bisa dimuat." };
  }

  return { rating: data ?? null, error: null };
}

export async function acceptOrder(orderId: string): Promise<{
  error: string | null;
}> {
  if (!supabase) {
    return { error: "Supabase belum diatur." };
  }

  const { error } = await supabase.rpc("accept_order", {
    p_order_id: orderId,
  });

  return {
    error: error
      ? databaseError(error, "Pesanan belum bisa diambil. Coba lagi.")
      : null,
  };
}

export async function updateOrderStatus(
  orderId: string,
  status: "in_progress" | "completed",
): Promise<{ error: string | null }> {
  if (!supabase) {
    return { error: "Supabase belum diatur." };
  }

  const { error } = await supabase.rpc("update_order_status", {
    p_order_id: orderId,
    p_status: status,
  });

  return {
    error: error
      ? databaseError(error, "Status pesanan belum bisa diubah. Coba lagi.")
      : null,
  };
}

export async function cancelOrder(
  orderId: string,
  reason: string,
): Promise<{ error: string | null }> {
  if (!supabase) {
    return { error: "Supabase belum diatur." };
  }

  const { error } = await supabase.rpc("cancel_order", {
    p_order_id: orderId,
    p_reason: reason,
  });

  return {
    error: error
      ? databaseError(error, "Pesanan belum bisa dibatalkan. Coba lagi.")
      : null,
  };
}

export async function sendSosReport(input: {
  orderId: string;
  reportedBy: string;
  category: SosCategory;
  message: string;
}): Promise<{ error: string | null }> {
  if (!supabase) {
    return { error: "Supabase belum diatur." };
  }

  const { error } = await supabase.from("sos_reports").insert({
    order_id: input.orderId,
    reported_by: input.reportedBy,
    category: input.category,
    message: input.message.trim() || null,
  });

  return {
    error: error
      ? databaseError(error, "Laporan SOS belum terkirim. Coba lagi.")
      : null,
  };
}

export type { ServiceType };
