import type { SupabaseClient } from "@supabase/supabase-js";
import { adminErrorMessage } from "@/lib/admin/errors";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  Database,
  DriverRow,
  FareRow,
  MerchantRow,
  OrderItemRow,
  OrderRow,
  OrderStatus,
  PaymentRow,
  PlaceRow,
  RatingRow,
  ServiceType,
  SosReportRow,
  UserRow,
} from "@/lib/supabase/database.types";

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

export type UserBrief = Pick<UserRow, "id" | "email" | "name" | "phone">;

export type AdminDriver = DriverRow & {
  user: UserBrief | null;
};

export type AdminMerchant = MerchantRow & {
  owner: UserBrief | null;
};

export type AdminOrder = OrderRow & {
  customer: UserBrief | null;
  driver: AdminDriver | null;
  merchant: MerchantRow | null;
};

export type AdminPayment = PaymentRow & {
  order: OrderRow | null;
  customer: UserBrief | null;
};

export type AdminSos = SosReportRow & {
  reporter: UserBrief | null;
};

export type AdminOrderDetail = {
  order: OrderRow;
  customer: UserBrief | null;
  driver: AdminDriver | null;
  merchant: MerchantRow | null;
  pickup: PlaceRow | null;
  dropoff: PlaceRow | null;
  items: OrderItemRow[];
  payment: PaymentRow | null;
  rating: RatingRow | null;
};

export type AdminCounts = {
  pendingOrders: number;
  activeOrders: number;
  unverifiedDrivers: number;
  unverifiedMerchants: number;
  openSos: number;
  pendingPayments: number;
};

export type DashboardData = {
  counts: AdminCounts;
  recentOrders: AdminOrder[];
  openSos: SosReportRow[];
};

export type NewFareInput = {
  serviceType: ServiceType;
  baseFare: number;
  perKm: number;
  minimumFare: number;
  maxDistanceKm: number;
  effectiveFrom: string;
};

function client(): SupabaseClient<Database> {
  return getSupabaseBrowserClient();
}

function fail<T>(
  error: Parameters<typeof adminErrorMessage>[0],
  fallback: string,
): Result<T> {
  return { ok: false, message: adminErrorMessage(error, fallback) };
}

function uniqueIds(ids: (string | null | undefined)[]): string[] {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
}

async function loadUserMap(
  ids: (string | null | undefined)[],
): Promise<Result<Map<string, UserBrief>>> {
  const unique = uniqueIds(ids);
  if (unique.length === 0) return { ok: true, data: new Map() };

  const { data, error } = await client()
    .from("users")
    .select("id,email,name,phone")
    .in("id", unique);

  if (error) return fail(error, "Data pengguna belum bisa dimuat.");

  return {
    ok: true,
    data: new Map(data.map((user) => [user.id, user])),
  };
}

async function hydrateOrders(rows: OrderRow[]): Promise<Result<AdminOrder[]>> {
  if (rows.length === 0) return { ok: true, data: [] };

  const driverIds = uniqueIds(rows.map((row) => row.driver_id));
  const merchantIds = uniqueIds(rows.map((row) => row.merchant_id));

  let drivers: DriverRow[] = [];
  if (driverIds.length > 0) {
    const { data, error } = await client()
      .from("drivers")
      .select("*")
      .in("id", driverIds);
    if (error) return fail(error, "Data driver belum bisa dimuat.");
    drivers = data;
  }

  let merchants: MerchantRow[] = [];
  if (merchantIds.length > 0) {
    const { data, error } = await client()
      .from("merchants")
      .select("*")
      .in("id", merchantIds);
    if (error) return fail(error, "Data merchant belum bisa dimuat.");
    merchants = data;
  }

  const usersResult = await loadUserMap([
    ...rows.map((row) => row.customer_id),
    ...drivers.map((driver) => driver.user_id),
  ]);
  if (!usersResult.ok) return usersResult;

  const users = usersResult.data;
  const driverMap = new Map(
    drivers.map((driver) => [
      driver.id,
      { ...driver, user: users.get(driver.user_id) ?? null },
    ]),
  );
  const merchantMap = new Map(merchants.map((item) => [item.id, item]));

  return {
    ok: true,
    data: rows.map((order) => ({
      ...order,
      customer: users.get(order.customer_id) ?? null,
      driver: order.driver_id ? driverMap.get(order.driver_id) ?? null : null,
      merchant: order.merchant_id
        ? merchantMap.get(order.merchant_id) ?? null
        : null,
    })),
  };
}

export async function loadAdminIdentity(
  userId: string,
): Promise<
  Result<{
    isAdmin: boolean;
    role: "admin" | "operator" | null;
    profile: UserBrief | null;
  }>
> {
  const [adminResult, profileResult] = await Promise.all([
    client()
      .from("admins")
      .select("user_id,role")
      .eq("user_id", userId)
      .maybeSingle(),
    client()
      .from("users")
      .select("id,email,name,phone")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  if (adminResult.error) {
    return fail(adminResult.error, "Status admin belum bisa diperiksa.");
  }

  return {
    ok: true,
    data: {
      isAdmin: Boolean(adminResult.data),
      role: adminResult.data?.role ?? null,
      profile: profileResult.data ?? null,
    },
  };
}

export async function loadDashboard(): Promise<Result<DashboardData>> {
  const sb = client();
  const [pending, active, drivers, merchants, sos, payments, recent, openSos] =
    await Promise.all([
      sb
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      sb
        .from("orders")
        .select("id", { count: "exact", head: true })
        .in("status", ["accepted", "in_progress"]),
      sb
        .from("drivers")
        .select("id", { count: "exact", head: true })
        .eq("is_verified", false),
      sb
        .from("merchants")
        .select("id", { count: "exact", head: true })
        .eq("is_verified", false),
      sb
        .from("sos_reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "open"),
      sb
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      sb
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6),
      sb
        .from("sos_reports")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const firstError = [
    pending.error,
    active.error,
    drivers.error,
    merchants.error,
    sos.error,
    payments.error,
    recent.error,
    openSos.error,
  ].find(Boolean);

  if (firstError) {
    return fail(firstError, "Ringkasan admin belum bisa dimuat.");
  }

  const ordersResult = await hydrateOrders(recent.data ?? []);
  if (!ordersResult.ok) return ordersResult;

  return {
    ok: true,
    data: {
      counts: {
        pendingOrders: pending.count ?? 0,
        activeOrders: active.count ?? 0,
        unverifiedDrivers: drivers.count ?? 0,
        unverifiedMerchants: merchants.count ?? 0,
        openSos: sos.count ?? 0,
        pendingPayments: payments.count ?? 0,
      },
      recentOrders: ordersResult.data,
      openSos: openSos.data ?? [],
    },
  };
}

export async function loadDrivers(): Promise<Result<AdminDriver[]>> {
  const { data, error } = await client()
    .from("drivers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return fail(error, "Data driver belum bisa dimuat.");

  const usersResult = await loadUserMap(data.map((driver) => driver.user_id));
  if (!usersResult.ok) return usersResult;

  return {
    ok: true,
    data: data.map((driver) => ({
      ...driver,
      user: usersResult.data.get(driver.user_id) ?? null,
    })),
  };
}

export async function loadMerchants(): Promise<Result<AdminMerchant[]>> {
  const { data, error } = await client()
    .from("merchants")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return fail(error, "Data merchant belum bisa dimuat.");

  const usersResult = await loadUserMap(
    data.map((merchant) => merchant.owner_user_id),
  );
  if (!usersResult.ok) return usersResult;

  return {
    ok: true,
    data: data.map((merchant) => ({
      ...merchant,
      owner: merchant.owner_user_id
        ? usersResult.data.get(merchant.owner_user_id) ?? null
        : null,
    })),
  };
}

export async function loadFares(): Promise<Result<FareRow[]>> {
  const { data, error } = await client()
    .from("fares")
    .select("*")
    .order("service_type", { ascending: true })
    .order("effective_from", { ascending: false })
    .limit(200);

  if (error) return fail(error, "Daftar tarif belum bisa dimuat.");

  return { ok: true, data };
}

export async function loadOrders(
  status: OrderStatus | "all",
  limit = 100,
): Promise<Result<AdminOrder[]>> {
  let query = client()
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return fail(error, "Daftar pesanan belum bisa dimuat.");

  return hydrateOrders(data);
}

export async function loadOrderDetail(
  orderId: string,
): Promise<Result<AdminOrderDetail>> {
  const sb = client();
  const { data: order, error } = await sb
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error) return fail(error, "Pesanan belum bisa dimuat.");
  if (!order) return { ok: false, message: "Pesanan tidak ditemukan." };

  let driver: DriverRow | null = null;
  if (order.driver_id) {
    const { data, error: driverError } = await sb
      .from("drivers")
      .select("*")
      .eq("id", order.driver_id)
      .maybeSingle();
    if (driverError) return fail(driverError, "Data driver belum bisa dimuat.");
    driver = data ?? null;
  }

  const placeIds = uniqueIds([order.pickup_place_id, order.dropoff_place_id]);
  const [customerResult, driverUserResult, merchantResult, placesResult, itemsResult, paymentResult, ratingResult] =
    await Promise.all([
      order.customer_id
        ? sb
            .from("users")
            .select("id,email,name,phone")
            .eq("id", order.customer_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      driver
        ? sb
            .from("users")
            .select("id,email,name,phone")
            .eq("id", driver.user_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      order.merchant_id
        ? sb
            .from("merchants")
            .select("*")
            .eq("id", order.merchant_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      placeIds.length > 0
        ? sb.from("places").select("*").in("id", placeIds)
        : Promise.resolve({ data: [] as PlaceRow[], error: null }),
      sb.from("order_items").select("*").eq("order_id", orderId),
      sb.from("payments").select("*").eq("order_id", orderId).maybeSingle(),
      sb.from("ratings").select("*").eq("order_id", orderId).maybeSingle(),
    ]);

  const relatedError = [
    customerResult.error,
    driverUserResult.error,
    merchantResult.error,
    placesResult.error,
    itemsResult.error,
    paymentResult.error,
    ratingResult.error,
  ].find(Boolean);

  if (relatedError) {
    return fail(relatedError, "Rincian pesanan belum bisa dimuat.");
  }

  const placeMap = new Map(
    (placesResult.data ?? []).map((place) => [place.id, place]),
  );

  return {
    ok: true,
    data: {
      order,
      customer: customerResult.data ?? null,
      driver: driver
        ? { ...driver, user: driverUserResult.data ?? null }
        : null,
      merchant: merchantResult.data ?? null,
      pickup: order.pickup_place_id
        ? placeMap.get(order.pickup_place_id) ?? null
        : null,
      dropoff: order.dropoff_place_id
        ? placeMap.get(order.dropoff_place_id) ?? null
        : null,
      items: itemsResult.data ?? [],
      payment: paymentResult.data ?? null,
      rating: ratingResult.data ?? null,
    },
  };
}

export async function loadSosReports(): Promise<Result<AdminSos[]>> {
  const { data, error } = await client()
    .from("sos_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return fail(error, "Laporan SOS belum bisa dimuat.");

  const usersResult = await loadUserMap(
    data.map((report) => report.reported_by),
  );
  if (!usersResult.ok) return usersResult;

  return {
    ok: true,
    data: data.map((report) => ({
      ...report,
      reporter: report.reported_by
        ? usersResult.data.get(report.reported_by) ?? null
        : null,
    })),
  };
}

export async function loadPayments(): Promise<Result<AdminPayment[]>> {
  const sb = client();
  const { data, error } = await sb
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return fail(error, "Data pembayaran belum bisa dimuat.");
  if (data.length === 0) return { ok: true, data: [] };

  const orderIds = uniqueIds(data.map((payment) => payment.order_id));
  const { data: orders, error: orderError } = await sb
    .from("orders")
    .select("*")
    .in("id", orderIds);

  if (orderError) return fail(orderError, "Data pesanan belum bisa dimuat.");

  const usersResult = await loadUserMap(
    (orders ?? []).map((order) => order.customer_id),
  );
  if (!usersResult.ok) return usersResult;

  const orderMap = new Map((orders ?? []).map((order) => [order.id, order]));

  return {
    ok: true,
    data: data.map((payment) => {
      const order = orderMap.get(payment.order_id) ?? null;
      return {
        ...payment,
        order,
        customer: order
          ? usersResult.data.get(order.customer_id) ?? null
          : null,
      };
    }),
  };
}

export async function setDriverVerified(
  driverId: string,
  verified: boolean,
): Promise<Result<DriverRow>> {
  const { data, error } = await client().rpc("admin_set_driver_verified", {
    p_driver_id: driverId,
    p_verified: verified,
  });

  if (error) return fail(error, "Status driver belum bisa diubah.");
  return { ok: true, data };
}

export async function setMerchantVerified(
  merchantId: string,
  verified: boolean,
): Promise<Result<MerchantRow>> {
  const { data, error } = await client().rpc("admin_set_merchant_verified", {
    p_merchant_id: merchantId,
    p_verified: verified,
  });

  if (error) return fail(error, "Status merchant belum bisa diubah.");
  return { ok: true, data };
}

export async function setSosStatus(
  reportId: string,
  status: SosReportRow["status"],
): Promise<Result<SosReportRow>> {
  const { data, error } = await client().rpc("admin_set_sos_status", {
    p_report_id: reportId,
    p_status: status,
  });

  if (error) return fail(error, "Status laporan belum bisa diubah.");
  return { ok: true, data };
}

export async function createFare(
  input: NewFareInput,
): Promise<Result<FareRow>> {
  const { data, error } = await client().rpc("admin_create_fare", {
    p_service_type: input.serviceType,
    p_base_fare: input.baseFare,
    p_per_km: input.perKm,
    p_minimum_fare: input.minimumFare,
    p_max_distance_km: input.maxDistanceKm,
    p_effective_from: input.effectiveFrom,
  });

  if (error) return fail(error, "Tarif baru belum bisa disimpan.");
  return { ok: true, data };
}

export async function setFareActive(
  fareId: string,
  active: boolean,
): Promise<Result<FareRow>> {
  const { data, error } = await client().rpc("admin_set_fare_active", {
    p_fare_id: fareId,
    p_active: active,
  });

  if (error) return fail(error, "Status tarif belum bisa diubah.");
  return { ok: true, data };
}

export async function cancelOrderAsAdmin(
  orderId: string,
  reason: string,
): Promise<Result<OrderRow>> {
  const { data, error } = await client().rpc("admin_cancel_order", {
    p_order_id: orderId,
    p_reason: reason.trim() || null,
  });

  if (error) return fail(error, "Pesanan belum bisa dibatalkan.");
  return { ok: true, data };
}

export async function recordPayment(input: {
  orderId: string;
  method: PaymentRow["method"];
  status: PaymentRow["status"];
  reference: string;
}): Promise<Result<PaymentRow>> {
  const { data, error } = await client().rpc("admin_record_payment", {
    p_order_id: input.orderId,
    p_method: input.method,
    p_status: input.status,
    p_reference: input.reference.trim() || null,
  });

  if (error) return fail(error, "Pembayaran belum bisa dicatat.");
  return { ok: true, data };
}

export async function setPaymentStatus(
  paymentId: string,
  status: PaymentRow["status"],
): Promise<Result<PaymentRow>> {
  const { data, error } = await client().rpc("admin_set_payment_status", {
    p_payment_id: paymentId,
    p_status: status,
  });

  if (error) return fail(error, "Status pembayaran belum bisa diubah.");
  return { ok: true, data };
}
