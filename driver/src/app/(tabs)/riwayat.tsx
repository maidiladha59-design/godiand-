import { useCallback, useState } from "react";
import { Redirect, useFocusEffect } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ChoiceTabs, type ChoiceOption } from "@/components/choice-tabs";
import { OrderCard } from "@/components/order-card";
import {
  Card,
  ErrorNote,
  Loading,
  Screen,
  ScreenTitle,
  SecondaryButton,
} from "@/components/ui";
import { useDriver } from "@/lib/driver";
import {
  loadAssignedOrders,
  type AssignedOrderSummary,
} from "@/lib/data/orders";
import { useSession } from "@/lib/session";
import { colors, space } from "@/lib/theme";

type Filter = "semua" | "selesai" | "batal";

const filters: ChoiceOption<Filter>[] = [
  { value: "semua", label: "Semua" },
  { value: "selesai", label: "Selesai" },
  { value: "batal", label: "Batal" },
];

export default function HistoryScreen() {
  const { session, loading: sessionLoading } = useSession();
  const { driver, loading: driverLoading } = useDriver();

  if (sessionLoading || driverLoading) {
    return <Loading label="Menyiapkan riwayat..." />;
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

  return <HistoryContent driverId={driver.id} />;
}

function HistoryContent({ driverId }: { driverId: string }) {
  const [filter, setFilter] = useState<Filter>("semua");
  const [orders, setOrders] = useState<AssignedOrderSummary[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const result = await loadAssignedOrders(driverId, [
      "completed",
      "cancelled",
    ]);

    setOrders(result.orders);
    setError(result.error ?? "");
    setLoadingData(false);
    setRefreshing(false);
  }, [driverId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function handleRefresh() {
    setRefreshing(true);
    load();
  }

  const visibleOrders = orders.filter((order) => {
    if (filter === "semua") return true;
    if (filter === "selesai") return order.status === "completed";
    return order.status === "cancelled";
  });

  return (
    <Screen onRefresh={handleRefresh} refreshing={refreshing}>
      <ScreenTitle
        subtitle="Pesanan yang sudah selesai atau dibatalkan."
        title="Riwayat"
      />

      <ChoiceTabs onChange={setFilter} options={filters} value={filter} />

      {loadingData ? (
        <Loading label="Memuat riwayat..." />
      ) : error ? (
        <Card>
          <ErrorNote message={error} />
          <SecondaryButton label="Muat ulang" onPress={load} />
        </Card>
      ) : visibleOrders.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>
            {filter === "semua"
              ? "Belum ada riwayat."
              : filter === "selesai"
                ? "Belum ada pesanan selesai."
                : "Belum ada pesanan batal."}
          </Text>
          <Text style={styles.muted}>
            Pesanan yang sudah kamu kerjakan akan muncul di sini.
          </Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {visibleOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyTitle: {
    color: colors.ink900,
    fontSize: 15,
    fontWeight: "800",
  },
  muted: {
    color: colors.ink600,
    fontSize: 13,
    lineHeight: 19,
  },
  list: {
    gap: space.md,
  },
});
