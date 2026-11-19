import type {
  DriverRow,
  OrderItemRow,
  OrderRow,
  OrderStatus,
  RatingRow,
  ServiceType,
  SosCategory,
} from "../database.types";
import { supabase } from "../supabase";
import { databaseError } from "./errors";

export type OrderSummary = Pick<
  OrderRow,
  | "id"
  | "service_type"
  | "status"
  | "created_at"
  | "total_amount"
  | "distance_km"
  | "pickup_address"
  | "dropoff_address"
>;

export type OrderDetail = Pick<
  OrderRow,
  | "id"
  | "customer_id"
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

export type DriverInfo = Pick<
  DriverRow,
  "id" | "vehicle_type" | "vehicle_plate"
>;

export type RatingInfo = Pick<RatingRow, "id" | "score" | "comment">;

export type NewOrderItem = {
  menuItemId: string;
  quantity: number;
};

export type NewOrderInput = {
  customerId: string;
  serviceType: ServiceType;
  merchantId: string | null;
  pickupPlaceId: string | null;
  dropoffPlaceId: string | null;
  pickupAddress: string | null;
  dropoffAddress: string | null;
  distanceKm: number;
  notes: string | null;
  items: NewOrderItem[];
};

const summaryFields =
  "id, service_type, status, created_at, total_amount, distance_km, pickup_address, dropoff_address";

const detailFields =
  "id, customer_id, driver_id, merchant_id, service_type, status, pickup_address, dropoff_address, distance_km, delivery_fee, items_total, total_amount, notes, cancellation_reason, created_at, accepted_at, completed_at, cancelled_at";

export const activeStatuses: OrderStatus[] = [
  "pending",
  "accepted",
  "in_progress",
];

export async function loadOrders(
  customerId: string,
  statuses?: OrderStatus[],
): Promise<{ orders: OrderSummary[]; error: string | null }> {
  if (!supabase) {
    return { orders: [], error: "Supabase belum diatur." };
  }

  let query = supabase
    .from("orders")
    .select(summaryFields)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (statuses) {
    query = query.in("status", statuses);
  }

  const { data, error } = await query;

  if (error) {
    return {
      orders: [],
      error: "Riwayat pesanan belum bisa dimuat. Coba lagi ya.",
    };
  }

  return { orders: data ?? [], error: null };
}

export async function loadActiveOrders(
  customerId: string,
): Promise<{ orders: OrderSummary[]; error: string | null }> {
  if (!supabase) {
    return { orders: [], error: "Supabase belum diatur." };
  }

  const { data, error } = await supabase
    .from("orders")
    .select(summaryFields)
    .eq("customer_id", customerId)
    .in("status", activeStatuses)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return {
      orders: [],
      error: "Pesanan aktif belum bisa dimuat. Coba lagi ya.",
    };
  }

  return { orders: data ?? [], error: null };
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
    return {
      items: [],
      error: "Rincian menu belum bisa dimuat.",
    };
  }

  return { items: data ?? [], error: null };
}

export async function loadDriver(
  driverId: string,
): Promise<{ driver: DriverInfo | null; error: string | null }> {
  if (!supabase) {
    return { driver: null, error: "Supabase belum diatur." };
  }

  const { data, error } = await supabase
    .from("drivers")
    .select("id, vehicle_type, vehicle_plate")
    .eq("id", driverId)
    .maybeSingle();

  if (error) {
    return { driver: null, error: "Data driver belum bisa dimuat." };
  }

  return { driver: data ?? null, error: null };
}

export async function loadRating(
  orderId: string,
): Promise<{ rating: RatingInfo | null; error: string | null }> {
  if (!supabase) {
    return { rating: null, error: "Supabase belum diatur." };
  }

  const { data, error } = await supabase
    .from("ratings")
    .select("id, score, comment")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) {
    return { rating: null, error: "Penilaian belum bisa dimuat." };
  }

  return { rating: data ?? null, error: null };
}

export async function estimateFare(
  serviceType: ServiceType,
  distance: number,
): Promise<{ fare: number | null; error: string | null }> {
  if (!supabase) {
    return { fare: null, error: "Supabase belum diatur." };
  }

  const { data, error } = await supabase.rpc("calculate_fare", {
    p_service_type: serviceType,
    p_distance_km: distance,
  });

  if (error) {
    return {
      fare: null,
      error: databaseError(error, "Tarif belum bisa dihitung. Coba lagi."),
    };
  }

  return { fare: data, error: null };
}

export async function createOrder(
  input: NewOrderInput,
): Promise<{ orderId: string | null; error: string | null }> {
  if (!supabase) {
    return { orderId: null, error: "Supabase belum diatur." };
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_id: input.customerId,
      service_type: input.serviceType,
      merchant_id: input.merchantId,
      pickup_place_id: input.pickupPlaceId,
      dropoff_place_id: input.dropoffPlaceId,
      pickup_address: input.pickupAddress,
      dropoff_address: input.dropoffAddress,
      distance_km: input.distanceKm,
      notes: input.notes,
    })
    .select("id")
    .single();

  if (error) {
    return {
      orderId: null,
      error: databaseError(error, "Pesanan belum bisa dibuat. Coba lagi."),
    };
  }

  if (input.items.length > 0) {
    const { error: itemError } = await supabase.from("order_items").insert(
      input.items.map((item) => ({
        order_id: data.id,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
      })),
    );

    if (itemError) {
      await supabase.rpc("cancel_order", {
        p_order_id: data.id,
        p_reason: "Menu gagal disimpan.",
      });

      return {
        orderId: null,
        error: "Menu gagal disimpan. Pesanan dibatalkan, coba lagi ya.",
      };
    }
  }

  return { orderId: data.id, error: null };
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

export async function submitRating(input: {
  orderId: string;
  raterId: string;
  driverId: string;
  score: number;
  comment: string;
}): Promise<{ error: string | null }> {
  if (!supabase) {
    return { error: "Supabase belum diatur." };
  }

  const { error } = await supabase.from("ratings").insert({
    order_id: input.orderId,
    rater_id: input.raterId,
    driver_id: input.driverId,
    score: input.score,
    comment: input.comment.trim() || null,
  });

  return {
    error: error
      ? databaseError(error, "Penilaian belum tersimpan. Coba lagi.")
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
