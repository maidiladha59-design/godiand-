import { useCallback, useState } from "react";
import {
  Redirect,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { PageHeader } from "@/components/page-header";
import { StatusBadge, isActiveStatus, statusNote } from "@/components/status-badge";
import {
  Card,
  DangerButton,
  ErrorNote,
  InfoNote,
  Loading,
  Screen,
  SecondaryButton,
} from "@/components/ui";
import { RatingForm } from "@/features/orders/rating-form";
import type {
  DriverInfo,
  OrderDetail,
  OrderItem,
  RatingInfo,
} from "@/lib/data/orders";
import {
  cancelOrder,
  loadDriver,
  loadOrder,
  loadOrderItems,
  loadRating,
} from "@/lib/data/orders";
import { formatDateTime, formatKm, formatRupiah } from "@/lib/format";
import { serviceLabel } from "@/lib/services";
import { useSession } from "@/lib/session";
import { colors, space } from "@/lib/theme";

export default function OrderDetailScreen() {
  const { session, loading } = useSession();
  const params = useLocalSearchParams<{ id?: string }>();

  if (loading) {
    return <Loading label="Menyiapkan pesanan..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  if (!params.id) {
    return <Redirect href="/" />;
  }

  return <OrderDetailContent orderId={params.id} userId={session.user.id} />;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function OrderDetailContent({
  orderId,
  userId,
}: {
  orderId: string;
  userId: string;
}) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [driver, setDriver] = useState<DriverInfo | null>(null);
  const [rating, setRating] = useState<RatingInfo | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    const result = await loadOrder(orderId);
    setOrder(result.order);

    if (!result.order) {
      setError(result.error ?? "Pesanan tidak ditemukan.");
      setItems([]);
      setDriver(null);
      setRating(null);
      setLoadingData(false);
      setRefreshing(false);
      return;
    }

    const [itemsResult, ratingResult, driverResult] = await Promise.all([
      loadOrderItems(orderId),
      loadRating(orderId),
      result.order.driver_id
        ? loadDriver(result.order.driver_id)
        : Promise.resolve({ driver: null, error: null }),
    ]);

    setItems(itemsResult.items);
    setRating(ratingResult.rating);
    setDriver(driverResult.driver);
    setError(
      result.error ??
        itemsResult.error ??
        ratingResult.error ??
        driverResult.error ??
        "",
    );
    setLoadingData(false);
    setRefreshing(false);
  }, [orderId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function handleRefresh() {
    setRefreshing(true);
    load();
  }

  async function handleCancel() {
    if (cancelling) return;

    setCancelling(true);
    setActionError("");

    const result = await cancelOrder(orderId, "Dibatalkan pelanggan.");

    setCancelling(false);

    if (result.error) {
      setActionError(result.error);
      return;
    }

    setCancelOpen(false);
    await load();
  }

  const canCancel =
    order?.status === "pending" || order?.status === "accepted";

  return (
    <Screen onRefresh={handleRefresh} refreshing={refreshing}>
      <PageHeader
        subtitle={order ? formatDateTime(order.created_at) : "Detail pesanan"}
        title={order ? serviceLabel(order.service_type) : "Pesanan"}
      />

      {loadingData ? (
        <Loading label="Memuat pesanan..." />
      ) : !order ? (
        <ErrorNote message={error || "Pesanan tidak ditemukan."} />
      ) : (
        <>
          <Card>
            <View style={styles.statusHead}>
              <Text style={styles.serviceTitle}>
                {serviceLabel(order.service_type)}
              </Text>
              <StatusBadge status={order.status} />
            </View>
            <Text style={styles.statusNote}>{statusNote(order.status)}</Text>

            {order.status === "cancelled" && order.cancellation_reason ? (
              <Text style={styles.cancellation}>
                Alasan: {order.cancellation_reason}
              </Text>
            ) : null}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatRupiah(order.total_amount)}
              </Text>
            </View>
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Rute</Text>
            <InfoRow label="Dari" value={order.pickup_address ?? "-"} />
            <InfoRow label="Ke" value={order.dropoff_address ?? "-"} />
            <InfoRow label="Jarak" value={formatKm(order.distance_km)} />
            <InfoRow label="Dibuat" value={formatDateTime(order.created_at)} />
            {order.notes ? (
              <InfoRow label="Catatan" value={order.notes} />
            ) : null}
            <Text style={styles.orderId}>
              ID pesanan: {order.id.slice(0, 8).toUpperCase()}
            </Text>
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Biaya</Text>

            {items.length > 0 ? (
              <>
                {items.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemMeta}>
                        {item.quantity} x {formatRupiah(item.unit_price)}
                      </Text>
                      {item.notes ? (
                        <Text style={styles.itemNotes}>{item.notes}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.itemTotal}>
                      {formatRupiah(item.line_total)}
                    </Text>
                  </View>
                ))}

                <InfoRow
                  label="Total menu"
                  value={formatRupiah(order.items_total)}
                />
              </>
            ) : null}

            <InfoRow
              label="Ongkir"
              value={formatRupiah(order.delivery_fee)}
            />

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatRupiah(order.total_amount)}
              </Text>
            </View>
          </Card>

          {driver ? (
            <Card>
              <Text style={styles.cardTitle}>Driver</Text>
              <Text style={styles.driverText}>
                {driver.vehicle_type === "motor" ? "Motor" : "Mobil"}
                {driver.vehicle_plate ? ` · ${driver.vehicle_plate}` : ""}
              </Text>
              <SecondaryButton
                label="Chat driver"
                onPress={() => router.push(`/chat/${order.id}`)}
              />
              <Text style={styles.muted}>
                Chat hanya untuk pesanan ini.
              </Text>
            </Card>
          ) : isActiveStatus(order.status) ? (
            <InfoNote message="Driver belum menerima pesanan. Chat aktif setelah driver menerima." />
          ) : null}

          {isActiveStatus(order.status) ? (
            <Card>
              <Text style={styles.cardTitle}>Butuh bantuan?</Text>
              <Text style={styles.muted}>
                Laporkan kejadian darurat yang terkait pesanan ini.
              </Text>
              <SecondaryButton
                label="Lapor darurat (SOS)"
                onPress={() => router.push(`/sos/${order.id}`)}
              />
            </Card>
          ) : null}

          {canCancel ? (
            cancelOpen ? (
              <Card>
                <Text style={styles.cardTitle}>Batalkan pesanan?</Text>
                <Text style={styles.muted}>
                  Pesanan yang dibatalkan tidak bisa dilanjutkan lagi.
                </Text>
                {actionError ? <ErrorNote message={actionError} /> : null}
                <DangerButton
                  label="Ya, batalkan"
                  loading={cancelling}
                  onPress={handleCancel}
                />
                <SecondaryButton
                  disabled={cancelling}
                  label="Tidak, kembali"
                  onPress={() => setCancelOpen(false)}
                />
              </Card>
            ) : (
              <SecondaryButton
                label="Batalkan pesanan"
                onPress={() => {
                  setActionError("");
                  setCancelOpen(true);
                }}
              />
            )
          ) : null}

          {order.status === "completed" && driver && !rating ? (
            <RatingForm
              driverId={driver.id}
              onSubmitted={load}
              orderId={order.id}
              userId={userId}
            />
          ) : null}

          {order.status === "completed" && rating ? (
            <Card>
              <Text style={styles.cardTitle}>Penilaianmu</Text>
              <Text style={styles.ratingScore}>{rating.score} / 5</Text>
              {rating.comment ? (
                <Text style={styles.ratingComment}>{rating.comment}</Text>
              ) : null}
              <Text style={styles.muted}>Terima kasih sudah menilai driver.</Text>
            </Card>
          ) : null}

          {error ? <ErrorNote message={error} /> : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  serviceTitle: {
    color: colors.ink900,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  statusNote: {
    color: colors.ink600,
    fontSize: 13,
    lineHeight: 19,
  },
  cancellation: {
    color: colors.coral700,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  cardTitle: {
    color: colors.ink900,
    fontSize: 16,
    fontWeight: "900",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
  },
  totalLabel: {
    color: colors.ink900,
    fontSize: 15,
    fontWeight: "900",
  },
  totalValue: {
    color: colors.brand700,
    fontSize: 20,
    fontWeight: "900",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.md,
  },
  infoLabel: {
    color: colors.ink500,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    minWidth: 70,
  },
  infoValue: {
    flex: 1,
    textAlign: "right",
    color: colors.ink900,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  orderId: {
    color: colors.ink500,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.brand100,
    paddingBottom: space.sm,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    color: colors.ink900,
    fontSize: 14,
    fontWeight: "800",
  },
  itemMeta: {
    color: colors.ink600,
    fontSize: 12,
  },
  itemNotes: {
    color: colors.ink600,
    fontSize: 12,
    fontStyle: "italic",
  },
  itemTotal: {
    color: colors.ink900,
    fontSize: 13,
    fontWeight: "800",
  },
  divider: {
    borderTopWidth: 2,
    borderTopColor: colors.ink900,
  },
  driverText: {
    color: colors.ink900,
    fontSize: 15,
    fontWeight: "800",
  },
  muted: {
    color: colors.ink600,
    fontSize: 12,
    lineHeight: 18,
  },
  ratingScore: {
    color: colors.brand700,
    fontSize: 24,
    fontWeight: "900",
  },
  ratingComment: {
    color: colors.ink700,
    fontSize: 13,
    lineHeight: 19,
  },
});
