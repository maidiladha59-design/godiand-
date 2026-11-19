import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { OsmMap } from "@/components/osm-map";
import {
  Card,
  DangerButton,
  ErrorNote,
  Loading,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from "@/components/ui";
import { formatDistanceKm, formatRupiah } from "@/lib/geo";
import {
  cancelRideOrder,
  fetchRideOrder,
  isActiveRideStatus,
  paymentMethodLabel,
  rideStatusLabel,
  type RideOrder,
} from "@/lib/ride-orders";
import { colors, radius, space } from "@/lib/theme";

const subtitleByStatus: Record<string, string> = {
  mencari_driver: "Pesananmu aktif. Kami carikan driver terdekat, tunggu sebentar ya.",
  pending: "Pesananmu aktif. Kami carikan driver terdekat, tunggu sebentar ya.",
  accepted: "Driver sudah ambil pesananmu dan sedang menuju titik jemput.",
  in_progress: "Hati-hati di jalan. Bayar langsung ke driver saat sampai.",
  completed: "Terima kasih sudah pakai GoDiandRide.",
  cancelled: "Pesanan sudah dibatalkan. Kamu bisa pesan lagi kapan saja.",
};

export function SearchingScreen({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<RideOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const finished = order ? !isActiveRideStatus(order.status) : false;

  const load = useCallback(async () => {
    try {
      const next = await fetchRideOrder(orderId);
      setOrder(next);
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Pesanan belum bisa dimuat. Coba lagi ya.",
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    let active = true;

    fetchRideOrder(orderId)
      .then((next) => {
        if (!active) return;
        setOrder(next);
        setError("");
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Pesanan belum bisa dimuat. Coba lagi ya.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    if (finished) {
      return () => {
        active = false;
      };
    }

    const timer = setInterval(() => {
      void load();
    }, 5000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [orderId, finished, load]);

  async function handleCancel() {
    if (cancelling) return;

    setCancelling(true);
    setCancelError("");

    try {
      await cancelRideOrder(orderId);
      router.replace("/ride");
    } catch (cause) {
      setCancelError(
        cause instanceof Error
          ? cause.message
          : "Pesanan belum bisa dibatalkan. Coba lagi ya.",
      );
      setCancelling(false);
    }
  }

  if (loading && !order) {
    return (
      <Screen>
        <Loading label="Memuat pesanan..." />
      </Screen>
    );
  }

  if (!order) {
    return (
      <Screen>
        <View style={styles.head}>
          <Text style={styles.eyebrow}>GoDiandRide</Text>
          <Text style={styles.title}>Pesanan tidak ketemu</Text>
          <Text style={styles.subtitle}>
            Mungkin pesanan ini sudah dihapus atau bukan milik akunmu.
          </Text>
        </View>

        {error ? <ErrorNote message={error} /> : null}

        <SecondaryButton
          label="Kembali ke pilih rute"
          onPress={() => router.replace("/ride")}
        />
      </Screen>
    );
  }

  const active = isActiveRideStatus(order.status);
  const payableLabel = order.payment_method
    ? `Bayar ${paymentMethodLabel(order.payment_method)} ke driver`
    : "Bayar langsung ke driver";

  return (
    <Screen>
      <View style={styles.head}>
        <Text style={styles.eyebrow}>GoDiandRide</Text>
        <Text style={styles.title}>{rideStatusLabel[order.status]}</Text>
        <Text style={styles.subtitle}>
          {subtitleByStatus[order.status] ?? ""}
        </Text>
      </View>

      {active ? (
        <Card>
          <View style={styles.searchRow}>
            <ActivityIndicator color={colors.brand600} size="large" />
            <View style={styles.searchText}>
              <Text style={styles.searchTitle}>
                {order.status === "mencari_driver" ||
                order.status === "pending"
                  ? "Lagi carikan driver..."
                  : "Driver sedang menuju kamu"}
              </Text>
              <Text style={styles.searchHint}>
                Halaman ini otomatis update. Tidak perlu di-refresh.
              </Text>
            </View>
          </View>

          {order.pickup_latitude !== null &&
          order.pickup_longitude !== null ? (
            <View style={styles.mapWrap}>
              <OsmMap
                height={170}
                latitude={order.pickup_latitude}
                longitude={order.pickup_longitude}
              />
            </View>
          ) : null}

          <View style={styles.route}>
            <View style={styles.routeRow}>
              <View style={styles.routeDot} />
              <View style={styles.routeText}>
                <Text style={styles.routeLabel}>Jemput</Text>
                <Text style={styles.routeValue}>
                  {order.pickup_address ?? "Lokasi jemput"}
                </Text>
              </View>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, styles.routeDotEnd]} />
              <View style={styles.routeText}>
                <Text style={styles.routeLabel}>Tujuan</Text>
                <Text style={styles.routeValue}>
                  {order.dropoff_address ?? "Tujuan"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryMeta}>
              {formatDistanceKm(Number(order.distance_km))}
            </Text>
            <Text style={styles.summaryFare}>
              {formatRupiah(Number(order.total_amount))}
            </Text>
          </View>
          <Text style={styles.payNote}>{payableLabel}</Text>

          {cancelError ? <ErrorNote message={cancelError} /> : null}

          {confirmingCancel ? (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmText}>
                Driver belum berangkat. Yakin mau batalkan pesanan ini?
              </Text>
              <View style={styles.confirmRow}>
                <View style={styles.confirmCol}>
                  <SecondaryButton
                    disabled={cancelling}
                    label="Lanjut tunggu"
                    onPress={() => setConfirmingCancel(false)}
                  />
                </View>
                <View style={styles.confirmCol}>
                  <DangerButton
                    label="Ya, batalkan"
                    loading={cancelling}
                    onPress={() => {
                      void handleCancel();
                    }}
                  />
                </View>
              </View>
            </View>
          ) : (
            <DangerButton
              label="Batalkan pesanan"
              onPress={() => setConfirmingCancel(true)}
            />
          )}
        </Card>
      ) : (
        <Card>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryMeta}>
              {formatDistanceKm(Number(order.distance_km))}
            </Text>
            <Text style={styles.summaryFare}>
              {formatRupiah(Number(order.total_amount))}
            </Text>
          </View>
          <Text style={styles.payNote}>{payableLabel}</Text>

          {order.status === "in_progress" ? (
            <Text style={styles.payNote}>
              Driver sedang mengantar kamu. Setelah selesai, pesanan ini masuk
              ke Riwayat.
            </Text>
          ) : (
            <PrimaryButton
              label="Pesan GoDiandRide lagi"
              onPress={() => router.replace("/ride")}
            />
          )}
        </Card>
      )}

      {error && order ? <ErrorNote message={error} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: {
    gap: 4,
  },
  eyebrow: {
    color: colors.brand700,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  title: {
    color: colors.ink900,
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  subtitle: {
    color: colors.ink600,
    fontSize: 14,
    lineHeight: 20,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  searchText: {
    flex: 1,
    gap: 2,
  },
  searchTitle: {
    color: colors.ink900,
    fontSize: 16,
    fontWeight: "900",
  },
  searchHint: {
    color: colors.ink600,
    fontSize: 12,
    lineHeight: 17,
  },
  mapWrap: {
    marginHorizontal: -space.xl,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.ink900,
  },
  route: {
    gap: 0,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.md,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.ink900,
    backgroundColor: colors.brand600,
    marginTop: 3,
  },
  routeDotEnd: {
    backgroundColor: colors.sun400,
  },
  routeLine: {
    width: 2,
    height: 14,
    marginLeft: 5,
    backgroundColor: colors.ink900,
  },
  routeText: {
    flex: 1,
    gap: 1,
  },
  routeLabel: {
    color: colors.ink500,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  routeValue: {
    color: colors.ink900,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.brand100,
    paddingTop: space.md,
  },
  summaryMeta: {
    color: colors.ink600,
    fontSize: 13,
    fontWeight: "800",
  },
  summaryFare: {
    color: colors.ink900,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  payNote: {
    color: colors.ink600,
    fontSize: 12,
    lineHeight: 17,
  },
  confirmBox: {
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.md,
    backgroundColor: colors.coral50,
    padding: space.md,
    gap: space.sm,
  },
  confirmText: {
    color: colors.coral700,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  confirmRow: {
    flexDirection: "row",
    gap: space.sm,
  },
  confirmCol: {
    flex: 1,
  },
});
