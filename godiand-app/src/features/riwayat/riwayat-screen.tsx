import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppScreen } from "@/components/app-screen";
import {
  Card,
  ErrorNote,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";
import { formatDistanceKm, formatRupiah } from "@/lib/geo";
import {
  fetchMyRideOrders,
  isActiveRideStatus,
  rideStatusLabel,
  type RideOrderStatus,
  type RideOrderSummary,
} from "@/lib/ride-orders";
import { colors, radius, space } from "@/lib/theme";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const badgeTones: Record<RideOrderStatus, { background: string; text: string }> =
  {
    mencari_driver: { background: colors.sun50, text: colors.ink900 },
    pending: { background: colors.sun50, text: colors.ink900 },
    accepted: { background: colors.brand50, text: colors.brand700 },
    in_progress: { background: colors.brand50, text: colors.brand700 },
    completed: { background: colors.mint50, text: colors.mint700 },
    cancelled: { background: colors.coral50, text: colors.coral700 },
  };

function formatDate(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${day} ${month} ${year} · ${hour}.${minute}`;
}

export function RiwayatScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<RideOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await fetchMyRideOrders();
      setOrders(result);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Riwayat belum bisa dimuat. Coba lagi ya.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppScreen active="riwayat">
      <Text style={styles.title}>Riwayat</Text>
      <Text style={styles.subtitle}>
        {orders.length > 0 && !loading
          ? `${orders.length} pesanan, terbaru di atas.`
          : "Pesanan GoDiandRide kamu tercatat di sini."}
      </Text>

      {loading ? (
        <Card>
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.brand600} />
            <Text style={styles.loadingText}>Memuat riwayat...</Text>
          </View>
        </Card>
      ) : null}

      {!loading && error ? (
        <Card>
          <ErrorNote message={error} />
          <SecondaryButton
            label="Coba lagi"
            onPress={() => {
              void load();
            }}
          />
        </Card>
      ) : null}

      {!loading && !error && orders.length === 0 ? (
        <Card>
          <Text style={styles.cardTitle}>Belum ada pesanan</Text>
          <Text style={styles.cardBody}>
            Setelah pesanan pertama, status dan tarifnya bisa kamu cek dari
            halaman ini.
          </Text>
          <PrimaryButton
            label="Pesan GoDiandRide"
            onPress={() => router.push("/ride")}
          />
        </Card>
      ) : null}

      {!loading && !error && orders.length > 0 ? (
        <Card style={styles.listCard}>
          {orders.map((order, index) => {
            const tone = badgeTones[order.status];

            return (
              <View
                key={order.id}
                style={[styles.row, index > 0 && styles.rowDivider]}
              >
                <View style={styles.rowHead}>
                  <View
                    style={[styles.badge, { backgroundColor: tone.background }]}
                  >
                    <Text style={[styles.badgeText, { color: tone.text }]}>
                      {rideStatusLabel[order.status]}
                    </Text>
                  </View>
                  <Text style={styles.date}>
                    {formatDate(order.created_at)}
                  </Text>
                </View>

                <View style={styles.route}>
                  <View style={styles.routeRow}>
                    <View style={styles.dotStart} />
                    <Text numberOfLines={2} style={styles.routeText}>
                      {order.pickup_address ?? "Titik jemput"}
                    </Text>
                  </View>
                  <View style={styles.routeRow}>
                    <View style={styles.dotEnd} />
                    <Text numberOfLines={2} style={styles.routeText}>
                      {order.dropoff_address ?? "Tujuan"}
                    </Text>
                  </View>
                </View>

                <View style={styles.foot}>
                  <Text style={styles.meta}>
                    {formatDistanceKm(Number(order.distance_km))}
                  </Text>
                  <Text style={styles.fare}>
                    {formatRupiah(Number(order.total_amount))}
                  </Text>
                </View>

                {isActiveRideStatus(order.status) ? (
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => {
                      router.push({
                        pathname: "/ride/mencari",
                        params: { id: order.id },
                      });
                    }}
                    style={({ pressed }) => [
                      styles.track,
                      pressed && styles.trackPressed,
                    ]}
                  >
                    <Text style={styles.trackText}>Lacak pesanan →</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </Card>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.ink900,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: colors.ink600,
    fontSize: 14,
    lineHeight: 20,
    marginTop: -space.sm,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  loadingText: {
    color: colors.ink600,
    fontSize: 13,
    fontWeight: "600",
  },
  cardTitle: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
  },
  cardBody: {
    color: colors.ink600,
    fontSize: 14,
    lineHeight: 21,
  },
  listCard: {
    padding: 0,
    gap: 0,
    overflow: "hidden",
  },
  row: {
    padding: space.lg,
    gap: space.sm,
  },
  rowDivider: {
    borderTopWidth: 2,
    borderTopColor: colors.brand100,
  },
  rowHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  badge: {
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "900",
  },
  date: {
    color: colors.ink500,
    fontSize: 11,
    fontWeight: "700",
  },
  route: {
    gap: 4,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.sm,
  },
  dotStart: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.ink900,
    backgroundColor: colors.brand600,
    marginTop: 4,
  },
  dotEnd: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.ink900,
    backgroundColor: colors.sun400,
    marginTop: 4,
  },
  routeText: {
    flex: 1,
    color: colors.ink900,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  foot: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.brand100,
    paddingTop: space.sm,
  },
  meta: {
    color: colors.ink600,
    fontSize: 12,
    fontWeight: "800",
  },
  fare: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  track: {
    alignSelf: "flex-start",
  },
  trackPressed: {
    opacity: 0.7,
  },
  trackText: {
    color: colors.brand700,
    fontSize: 12,
    fontWeight: "900",
  },
});
