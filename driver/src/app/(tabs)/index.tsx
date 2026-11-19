import { useCallback, useState } from "react";
import { Redirect, router, useFocusEffect } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ChoiceTabs, type ChoiceOption } from "@/components/choice-tabs";
import { OrderCard } from "@/components/order-card";
import {
  Badge,
  BrandHeader,
  Card,
  ErrorNote,
  InfoNote,
  Loading,
  Screen,
  SecondaryButton,
} from "@/components/ui";
import { useDriver } from "@/lib/driver";
import { loadActiveOrder, type AssignedOrderSummary } from "@/lib/data/orders";
import { useSession } from "@/lib/session";
import { colors, space } from "@/lib/theme";

const statusOptions: ChoiceOption<"offline" | "available">[] = [
  { value: "available", label: "Online" },
  { value: "offline", label: "Offline" },
];

export default function DriverHomeScreen() {
  const { session, loading: sessionLoading } = useSession();
  const { driver, loading: driverLoading, refresh, updateStatus } = useDriver();

  if (sessionLoading || driverLoading) {
    return <Loading label="Menyiapkan beranda..." />;
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
    <DriverHomeContent
      driverId={driver.id}
      status={driver.status}
      refresh={refresh}
      updateStatus={updateStatus}
    />
  );
}

function DriverHomeContent({
  driverId,
  status,
  refresh,
  updateStatus,
}: {
  driverId: string;
  status: "offline" | "available" | "busy";
  refresh: () => Promise<void>;
  updateStatus: (
    value: "offline" | "available",
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
}) {
  const [activeOrder, setActiveOrder] = useState<AssignedOrderSummary | null>(
    null,
  );
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState("");

  const load = useCallback(async () => {
    const [result] = await Promise.all([
      loadActiveOrder(driverId),
      refresh(),
    ]);

    setActiveOrder(result.order);
    setError(result.error ?? "");
    setLoadingData(false);
    setRefreshing(false);
  }, [driverId, refresh]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function handleRefresh() {
    setRefreshing(true);
    load();
  }

  async function handleStatus(next: "offline" | "available") {
    if (statusSaving) return;

    setStatusSaving(true);
    setStatusError("");

    const result = await updateStatus(next);

    setStatusSaving(false);

    if (!result.ok) {
      setStatusError(result.message);
    }
  }

  const statusTitle =
    status === "busy"
      ? "Sedang mengantar"
      : status === "available"
        ? "Online, siap menerima pesanan"
        : "Offline, belum menerima pesanan";

  return (
    <Screen onRefresh={handleRefresh} refreshing={refreshing}>
      <BrandHeader />

      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Halo, Driver</Text>
        <Text style={styles.greetingSubtitle}>
          Cek status dan pesanan aktifmu di sini.
        </Text>
      </View>

      {error ? <ErrorNote message={error} /> : null}

      <Card>
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>Status kamu</Text>
          <Badge label="Terverifikasi" tone="mint" />
        </View>

        <Text style={styles.statusTitle}>{statusTitle}</Text>

        {status !== "busy" ? (
          <ChoiceTabs
            onChange={handleStatus}
            options={statusOptions}
            value={status === "available" ? "available" : "offline"}
          />
        ) : null}

        {statusSaving ? (
          <Text style={styles.muted}>Menyimpan status...</Text>
        ) : null}

        {statusError ? <ErrorNote message={statusError} /> : null}

        <Text style={styles.muted}>
          {status === "busy"
            ? "Selesaikan pesanan aktif dulu sebelum menerima pesanan baru."
            : "Online berarti kamu siap menerima pesanan masuk."}
        </Text>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pesanan aktif</Text>

        {loadingData ? (
          <Loading label="Memuat pesanan aktif..." />
        ) : activeOrder ? (
          <OrderCard order={activeOrder} />
        ) : (
          <Card>
            <Text style={styles.emptyTitle}>Belum ada pesanan aktif.</Text>
            <Text style={styles.muted}>
              {status === "available"
                ? "Buka tab Cari untuk melihat pesanan yang menunggu driver."
                : "Ubah status ke Online saat siap menerima pesanan."}
            </Text>
            <SecondaryButton
              label="Cari pesanan"
              onPress={() => router.navigate("/cari")}
            />
          </Card>
        )}
      </View>

      {status === "available" && !activeOrder ? (
        <InfoNote message="Pesanan baru bisa diambil dari tab Cari. Tarik ke bawah untuk memperbarui data." />
      ) : null}
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
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  cardTitle: {
    color: colors.ink900,
    fontSize: 16,
    fontWeight: "900",
  },
  statusTitle: {
    color: colors.ink900,
    fontSize: 15,
    fontWeight: "800",
  },
  section: {
    gap: space.md,
  },
  sectionTitle: {
    color: colors.ink900,
    fontSize: 17,
    fontWeight: "900",
  },
  emptyTitle: {
    color: colors.ink900,
    fontSize: 15,
    fontWeight: "800",
  },
  muted: {
    color: colors.ink600,
    fontSize: 12,
    lineHeight: 18,
  },
});
