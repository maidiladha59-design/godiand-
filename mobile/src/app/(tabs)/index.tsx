import { useCallback, useState } from "react";
import { Redirect, router, useFocusEffect } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { OrderCard } from "@/components/order-card";
import { ServiceGrid } from "@/components/service-grid";
import {
  BrandHeader,
  Card,
  ErrorNote,
  Loading,
  Screen,
} from "@/components/ui";
import { loadActiveOrders, type OrderSummary } from "@/lib/data/orders";
import { loadProfile } from "@/lib/data/profile";
import { useSession } from "@/lib/session";
import { colors, space } from "@/lib/theme";

export default function BerandaScreen() {
  const { session, loading } = useSession();

  if (loading) {
    return <Loading label="Menyiapkan beranda..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  return <BerandaContent userId={session.user.id} />;
}

function BerandaContent({ userId }: { userId: string }) {
  const [name, setName] = useState("");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [profile, activeOrders] = await Promise.all([
      loadProfile(userId),
      loadActiveOrders(userId),
    ]);

    setName(profile.profile?.name ?? "");
    setOrders(activeOrders.orders);
    setError(profile.error ?? activeOrders.error ?? "");
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

  const displayName = name.trim() || "Warga Banda Aceh";

  return (
    <Screen onRefresh={handleRefresh} refreshing={refreshing}>
      <BrandHeader />

      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Halo, {displayName}</Text>
        <Text style={styles.greetingSubtitle}>
          Mau pakai layanan apa hari ini?
        </Text>
      </View>

      {error ? <ErrorNote message={error} /> : null}

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Pesanan aktif</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate("/riwayat")}
          >
            <Text style={styles.link}>Riwayat</Text>
          </Pressable>
        </View>

        {loadingData ? (
          <Loading label="Memuat pesanan..." />
        ) : orders.length === 0 ? (
          <Card>
            <Text style={styles.emptyTitle}>Belum ada pesanan aktif.</Text>
            <Text style={styles.emptyText}>
              Pilih layanan di bawah untuk mulai pesan.
            </Text>
          </Card>
        ) : (
          <View style={styles.list}>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Layanan</Text>
        <ServiceGrid />
      </View>

      <Text style={styles.footnote}>Godiand · Banda Aceh</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    gap: 2,
  },
  greetingText: {
    color: colors.ink900,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  greetingSubtitle: {
    color: colors.ink600,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    gap: space.md,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.ink900,
    fontSize: 17,
    fontWeight: "900",
  },
  link: {
    color: colors.brand700,
    fontSize: 13,
    fontWeight: "800",
  },
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
  footnote: {
    color: colors.ink500,
    fontSize: 12,
    textAlign: "center",
  },
});
