import { useCallback, useState } from "react";
import {
  Redirect,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { InfoRow } from "@/components/info-row";
import { PageHeader } from "@/components/page-header";
import {
  StatusBadge,
  isDriverActiveStatus,
  statusNote,
} from "@/components/status-badge";
import {
  Card,
  DangerButton,
  ErrorNote,
  InfoNote,
  Loading,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from "@/components/ui";
import { useDriver } from "@/lib/driver";
import {
  acceptOrder,
  cancelOrder,
  loadOrder,
  loadOrderItems,
  loadRating,
  updateOrderStatus,
  type OrderDetail,
  type OrderItem,
  type RatingInfo,
} from "@/lib/data/orders";
import { formatDateTime, formatKm, formatRupiah } from "@/lib/format";
import { serviceLabel } from "@/lib/services";
import { useSession } from "@/lib/session";
import { colors, space } from "@/lib/theme";

export default function DriverOrderScreen() {
  const { session, loading: sessionLoading } = useSession();
  const { driver, loading: driverLoading, refresh } = useDriver();
  const params = useLocalSearchParams<{ id?: string }>();

  if (sessionLoading || driverLoading) {
    return <Loading label="Menyiapkan pesanan..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  if (!driver) {
    return <Redirect href="/daftar" />;
  }

  if (!driver.is_verified) {
    return <Redirect href="/verifikasi" />;
  }

  if (!params.id) {
    return <Redirect href="/" />;
  }

  return (
    <DriverOrderContent
      driverId={driver.id}
      driverStatus={driver.status}
      orderId={params.id}
      refresh={refresh}
    />
  );
}

function DriverOrderContent({
  driverId,
  driverStatus,
  orderId,
  refresh,
}: {
  driverId: string;
  driverStatus: "offline" | "available" | "busy";
  orderId: string;
  refresh: () => Promise<void>;
}) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [rating, setRating] = useState<RatingInfo | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);

  const load = useCallback(async () => {
    const result = await loadOrder(orderId);
    setOrder(result.order);

    if (!result.order) {
      setItems([]);
      setRating(null);
      setError(result.error ?? "Pesanan tidak ditemukan.");
      setLoadingData(false);
      setRefreshing(false);
      return;
    }

    const [itemsResult, ratingResult] = await Promise.all([
      loadOrderItems(orderId),
      loadRating(orderId),
    ]);

    setItems(itemsResult.items);
    setRating(ratingResult.rating);
    setError(
      result.error ?? itemsResult.error ?? ratingResult.error ?? "",
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

  async function handleAccept() {
    if (actionBusy) return;

    setActionBusy(true);
    setActionError("");

    const result = await acceptOrder(orderId);

    if (result.error) {
      setActionError(result.error);
      setActionBusy(false);
      await load();
      return;
    }

    await refresh();
    await load();
    setActionBusy(false);
  }

  async function handleStart() {
    if (actionBusy) return;

    setActionBusy(true);
    setActionError("");

    const result = await updateOrderStatus(orderId, "in_progress");

    setActionBusy(false);

    if (result.error) {
      setActionError(result.error);
      return;
    }

    await load();
  }

  async function handleComplete() {
    if (actionBusy) return;

    setActionBusy(true);
    setActionError("");

    const result = await updateOrderStatus(orderId, "completed");

    if (result.error) {
      setActionError(result.error);
      setActionBusy(false);
      return;
    }

    await refresh();
    await load();
    setActionBusy(false);
  }

  async function handleCancel() {
    if (actionBusy) return;

    setActionBusy(true);
    setActionError("");

    const result = await cancelOrder(orderId, "Dibatalkan driver.");

    if (result.error) {
      setActionError(result.error);
      setActionBusy(false);
      return;
    }

    setCancelOpen(false);
    await refresh();
    await load();
    setActionBusy(false);
  }

  if (loadingData) {
    return <Loading label="Memuat pesanan..." />;
  }

  if (!order) {
    return (
      <Screen>
        <PageHeader title="Pesanan" />
        <ErrorNote message={error || "Pesanan tidak ditemukan."} />
        <SecondaryButton label="Kembali" onPress={() => router.back()} />
      </Screen>
    );
  }

  const isMine = order.driver_id === driverId;
  const awaitingDriver =
    order.status === "pending" || order.status === "mencari_driver";
  const canAccept =
    awaitingDriver &&
    order.driver_id === null &&
    driverStatus === "available";
  const isActive = isMine && isDriverActiveStatus(order.status);
  const canCancel = isMine && order.status === "accepted";

  return (
    <Screen onRefresh={handleRefresh} refreshing={refreshing}>
      <PageHeader
        subtitle={formatDateTime(order.created_at)}
        title={serviceLabel(order.service_type)}
      />

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
          <Text style={styles.totalLabel}>Total pesanan</Text>
          <Text style={styles.totalValue}>
            {formatRupiah(order.total_amount)}
          </Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Rute</Text>
        <InfoRow label="Jemput" value={order.pickup_address ?? "-"} />
        <InfoRow label="Antar" value={order.dropoff_address ?? "-"} />
        <InfoRow label="Jarak" value={formatKm(order.distance_km)} />
        <InfoRow label="Dibuat" value={formatDateTime(order.created_at)} />
        {order.notes ? <InfoRow label="Catatan" value={order.notes} /> : null}
        <Text style={styles.orderId}>
          ID pesanan: {order.id.slice(0, 8).toUpperCase()}
        </Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Rincian</Text>

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
        ) : awaitingDriver ? (
          <InfoNote message="Rincian menu dan chat pelanggan terbuka setelah pesanan diambil." />
        ) : null}

        <InfoRow label="Ongkir" value={formatRupiah(order.delivery_fee)} />

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatRupiah(order.total_amount)}
          </Text>
        </View>

        <Text style={styles.muted}>
          Pembayaran tunai atau QRIS belum dicatat di aplikasi driver.
        </Text>
      </Card>

      {actionError ? <ErrorNote message={actionError} /> : null}

      {canAccept ? (
        <Card>
          <Text style={styles.cardTitle}>Ambil pesanan ini?</Text>
          <Text style={styles.muted}>
            Setelah diambil, pesanan akan masuk ke daftar aktifmu.
          </Text>
          <PrimaryButton
            label="Ambil pesanan"
            loading={actionBusy}
            onPress={handleAccept}
          />
        </Card>
      ) : null}

      {awaitingDriver && order.driver_id === null && !canAccept ? (
        <InfoNote
          message={
            driverStatus === "offline"
              ? "Ubah status ke Online di Beranda dulu sebelum mengambil pesanan."
              : driverStatus === "busy"
                ? "Selesaikan pesanan aktif dulu sebelum mengambil pesanan baru."
                : "Pesanan ini belum bisa diambil dari akunmu."
          }
        />
      ) : null}

      {isMine && order.status === "accepted" ? (
        <Card>
          <Text style={styles.cardTitle}>Langkah berikutnya</Text>
          <Text style={styles.muted}>
            Jemput pesanan di titik awal, lalu tekan tombol saat perjalanan
            dimulai.
          </Text>
          <PrimaryButton
            label="Mulai antar"
            loading={actionBusy}
            onPress={handleStart}
          />
        </Card>
      ) : null}

      {isMine && order.status === "in_progress" ? (
        <Card>
          <Text style={styles.cardTitle}>Selesaikan pesanan</Text>
          <Text style={styles.muted}>
            Tekan tombol setelah pesanan tiba di tujuan.
          </Text>
          <PrimaryButton
            disabled={actionBusy}
            label="Selesaikan pesanan"
            loading={actionBusy}
            onPress={handleComplete}
          />
        </Card>
      ) : null}

      {isMine && order.status !== "cancelled" ? (
        <Card>
          <Text style={styles.cardTitle}>Hubungi pelanggan</Text>
          <Text style={styles.muted}>
            Chat hanya untuk pesanan ini. Jangan minta pembayaran di luar
            kesepakatan.
          </Text>
          <SecondaryButton
            label="Chat pelanggan"
            onPress={() => router.push(`/chat/${order.id}`)}
          />
        </Card>
      ) : null}

      {isActive ? (
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
              Gunakan hanya kalau kamu benar-benar tidak bisa melanjutkan.
              Pesanan akan dilepas ke driver lain.
            </Text>
            <DangerButton
              label="Ya, batalkan"
              loading={actionBusy}
              onPress={handleCancel}
            />
            <SecondaryButton
              disabled={actionBusy}
              label="Tidak, kembali"
              onPress={() => setCancelOpen(false)}
            />
          </Card>
        ) : (
          <SecondaryButton
            label="Batalkan karena berhalangan"
            onPress={() => {
              setActionError("");
              setCancelOpen(true);
            }}
          />
        )
      ) : null}

      {order.status === "completed" ? (
        <Card>
          <Text style={styles.cardTitle}>Penilaian pelanggan</Text>
          {rating ? (
            <>
              <Text style={styles.ratingScore}>{rating.score} / 5</Text>
              {rating.comment ? (
                <Text style={styles.ratingComment}>{rating.comment}</Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.muted}>Belum ada penilaian.</Text>
          )}
        </Card>
      ) : null}

      {error ? <ErrorNote message={error} /> : null}
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
