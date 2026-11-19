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
} from "@/components/ui";
import type { OrderStatus } from "@/lib/database.types";
import {
  activeStatuses,
  loadOrders,
  type OrderSummary,
} from "@/lib/data/orders";
import { useSession } from "@/lib/session";
import { colors, space } from "@/lib/theme";

type Filter = "semua" | "aktif" | "selesai" | "batal";

const filters: ChoiceOption<Filter>[] = [
  { value: "semua", label: "Semua" },
  { value: "aktif", label: "Aktif" },
  { value: "selesai", label: "Selesai" },
  { value: "batal", label: "Batal" },
];

const filterStatuses: Record<Exclude<Filter, "semua">, OrderStatus[]> = {
  aktif: activeStatuses,
  selesai: ["completed"],
  batal: ["cancelled"],
};

export default function RiwayatScreen() {
  const { session, loading } = useSession();

  if (loading) {
    return <Loading label="Menyiapkan riwayat..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  return <RiwayatContent userId={session.user.id} />;
}

function RiwayatContent({ userId }: { userId: string }) {
  const [filter, setFilter] = useState<Filter>("semua");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const result = await loadOrders(userId);
    setOrders(result.orders);
    setError(result.error ?? "");
    setLoadingData(false);
    setRefreshing(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function handleRefresh() {
    setRefreshing(true);
    load();
  }

  const visibleOrders =
    filter === "semua"
      ? orders
      : orders.filter((order) =>
          filterStatuses[filter].includes(order.status),
        );

  return (
    <Screen onRefresh={handleRefresh} refreshing={refreshing}>
      <ScreenTitle
        subtitle="Semua pesanan yang kamu buat di Godiand."
        title="Riwayat"
      />

      <ChoiceTabs onChange={setFilter} options={filters} value={filter} />

      {error ? <ErrorNote message={error} /> : null}

      {loadingData ? (
        <Loading label="Memuat riwayat..." />
      ) : visibleOrders.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>Belum ada pesanan di sini.</Text>
          <Text style={styles.emptyText}>
            Pesanan yang kamu buat akan muncul di daftar ini.
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
  list: {
    gap: space.md,
  },
  emptyTitle: {
    color: colors.ink900,
    fontSize: 15,
    fontWeight: "800",
  },
  emptyText: {
    color: colors.ink600,
    fontSize: 13,
    lineHeight: 19,
  },
});
