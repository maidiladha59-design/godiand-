import { useCallback, useState } from "react";
import { Redirect, router, useFocusEffect } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AvailableOrderCard } from "@/components/available-order-card";
import {
  Card,
  ErrorNote,
  InfoNote,
  Loading,
  Screen,
  ScreenTitle,
  SecondaryButton,
} from "@/components/ui";
import { useDriver } from "@/lib/driver";
import {
  acceptOrder,
  loadAvailableOrders,
  type AvailableOrder,
} from "@/lib/data/orders";
import { useSession } from "@/lib/session";
import { colors, space } from "@/lib/theme";

export default function FindOrdersScreen() {
  const { session, loading: sessionLoading } = useSession();
  const {
    driver,
    loading: driverLoading,
    refresh,
  } = useDriver();

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

  return (
    <FindOrdersContent
      status={driver.status}
      refresh={refresh}
    />
  );
}

function FindOrdersContent({
  status,
  refresh,
}: {
  status: "offline" | "available" | "busy";
  refresh: () => Promise<void>;
}) {
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await loadAvailableOrders();
    setOrders(result.orders);
    setError(result.error ?? "");
    setLoadingData(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function handleRefresh() {
    setRefreshing(true);
    load();
  }

  async function handleAccept(orderId: string) {
    if (acceptingId) return;

    setAcceptingId(orderId);
    setActionError("");

    const result = await acceptOrder(orderId);

    if (result.error) {
      setActionError(result.error);
      setAcceptingId(null);
      await load();
      return;
    }

    await refresh();
    setAcceptingId(null);
    router.push(`/pesanan/${orderId}`);
  }

  return (
    <Screen onRefresh={handleRefresh} refreshing={refreshing}>
      <ScreenTitle
        subtitle="Pesanan baru yang belum diambil driver lain."
        title="Cari pesanan"
      />

      {status === "busy" ? (
        <Card>
          <Text style={styles.blockTitle}>Kamu sedang mengantar.</Text>
          <Text style={styles.muted}>
            Selesaikan pesanan aktif dulu sebelum mengambil pesanan baru.
          </Text>
          <SecondaryButton
            label="Buka Beranda"
            onPress={() => router.navigate("/")}
          />
        </Card>
      ) : status === "offline" ? (
        <Card>
          <Text style={styles.blockTitle}>Kamu sedang offline.</Text>
          <Text style={styles.muted}>
            Ubah status ke Online di Beranda supaya bisa mengambil pesanan.
          </Text>
          <SecondaryButton
            label="Buka Beranda"
            onPress={() => router.navigate("/")}
          />
        </Card>
      ) : (
        <>
          <InfoNote message="Rincian menu dan chat pelanggan terbuka setelah pesanan kamu ambil." />

          {actionError ? <ErrorNote message={actionError} /> : null}

          {loadingData ? (
            <Loading label="Memuat pesanan tersedia..." />
          ) : error ? (
            <Card>
              <ErrorNote message={error} />
              <SecondaryButton label="Muat ulang" onPress={load} />
            </Card>
          ) : orders.length === 0 ? (
            <Card>
              <Text style={styles.blockTitle}>Belum ada pesanan.</Text>
              <Text style={styles.muted}>
                Tarik ke bawah untuk memuat ulang. Pesanan baru akan muncul di
                sini.
              </Text>
            </Card>
          ) : (
            <View style={styles.list}>
              {orders.map((order) => (
                <AvailableOrderCard
                  accepting={acceptingId === order.id}
                  disabled={acceptingId !== null}
                  key={order.id}
                  onAccept={() => handleAccept(order.id)}
                  order={order}
                />
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  blockTitle: {
    color: colors.ink900,
    fontSize: 16,
    fontWeight: "900",
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
