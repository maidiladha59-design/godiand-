import { Ionicons } from "@expo/vector-icons";
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
  isRunningRideStatus,
  rideStatusLabel,
  type RideOrderStatus,
  type RideOrderSummary,
} from "@/lib/ride-orders";
import { colors, hardShadow, radius, space } from "@/lib/theme";

type ActivityTab = "berjalan" | "riwayat";

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

const tabs: { key: ActivityTab; label: string }[] = [
  { key: "berjalan", label: "Berjalan" },
  { key: "riwayat", label: "Riwayat" },
];

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

export function AktivitasScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<ActivityTab>("berjalan");
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
          : "Aktivitas belum bisa dimuat. Coba lagi ya.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runningOrders = orders.filter((order) =>
    isRunningRideStatus(order.status),
  );
  const pastOrders = orders.filter(
    (order) => !isRunningRideStatus(order.status),
  );
  const visibleOrders = tab === "berjalan" ? runningOrders : pastOrders;

  return (
    <AppScreen active="aktivitas">
      <View style={styles.head}>
        <Text style={styles.title}>Aktivitas</Text>
        <Text style={styles.subtitle}>
          Pesanan yang sedang berjalan dan riwayat pesananmu ada di sini.
        </Text>
      </View>

      <View accessibilityRole="tablist" style={styles.tabs}>
        {tabs.map((item) => {
          const selected = tab === item.key;
          const count = item.key === "berjalan" ? runningOrders.length : null;

          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              key={item.key}
              onPress={() => setTab(item.key)}
              style={({ pressed }) => [
                styles.tab,
                selected && styles.tabActive,
                pressed && !selected && styles.tabPressed,
              ]}
            >
              <Text style={[styles.tabText, selected && styles.tabTextActive]}>
                {item.label}
              </Text>
              {count ? (
                <View style={styles.tabCount}>
                  <Text style={styles.tabCountText}>{count}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <Card>
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.brand600} />
            <Text style={styles.loadingText}>Memuat aktivitas...</Text>
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

      {!loading && !error && visibleOrders.length === 0 ? (
        <Card style={styles.emptyCard}>
          <View style={styles.iconBox}>
            <Ionicons
              color={colors.ink900}
              name={tab === "berjalan" ? "time-outline" : "receipt-outline"}
              size={30}
            />
          </View>
          {tab === "berjalan" ? (
            <>
              <Text style={styles.emptyTitle}>Belum ada pesanan berjalan</Text>
              <Text style={styles.emptyBody}>
                Pesanan yang sedang dicarikan driver atau dalam perjalanan akan
                muncul di sini.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.emptyTitle}>Belum ada riwayat</Text>
              <Text style={styles.emptyBody}>
                Pesanan yang sudah selesai atau dibatalkan akan tampil di sini.
              </Text>
            </>
          )}
          <View style={styles.emptyAction}>
            <PrimaryButton
              label="Pesan GoDiandRide"
              onPress={() => router.push("/ride")}
            />
          </View>
        </Card>
      ) : null}

      {!loading && !error && visibleOrders.length > 0 ? (
        <Card style={styles.listCard}>
          {visibleOrders.map((order, index) => {
            const tone = badgeTones[order.status];

            return (
              <Pressable
                accessibilityHint="Membuka detail pesanan"
                accessibilityLabel={`Buka pesanan ke ${
                  order.dropoff_address ?? "tujuan"
                }`}
                accessibilityRole="button"
                key={order.id}
                onPress={() => {
                  router.push({
                    pathname: "/ride/mencari",
                    params: { id: order.id },
                  });
                }}
                style={({ pressed }) => [
                  styles.row,
                  index > 0 && styles.rowDivider,
                  pressed && styles.rowPressed,
                ]}
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

                <Text style={styles.trackText}>
                  {isRunningRideStatus(order.status)
                    ? "Lacak pesanan →"
                    : "Lihat detail →"}
                </Text>
              </Pressable>
            );
          })}
        </Card>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  head: {
    gap: 6,
  },
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
  },
  tabs: {
    flexDirection: "row",
    gap: 4,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    padding: 4,
    ...hardShadow,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
  },
  tabActive: {
    borderColor: colors.ink900,
    backgroundColor: colors.sun400,
  },
  tabPressed: {
    backgroundColor: colors.sun50,
  },
  tabText: {
    color: colors.ink600,
    fontSize: 14,
    fontWeight: "800",
  },
  tabTextActive: {
    color: colors.ink900,
  },
  tabCount: {
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.ink900,
    backgroundColor: colors.brand600,
    paddingHorizontal: 4,
  },
  tabCountText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "900",
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
  emptyCard: {
    alignItems: "center",
    paddingVertical: space.xxl,
  },
  iconBox: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.md,
    backgroundColor: colors.sun400,
  },
  emptyTitle: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyBody: {
    color: colors.ink600,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  emptyAction: {
    alignSelf: "stretch",
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
  rowPressed: {
    backgroundColor: colors.sun50,
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
  trackText: {
    color: colors.brand700,
    fontSize: 12,
    fontWeight: "900",
  },
});
