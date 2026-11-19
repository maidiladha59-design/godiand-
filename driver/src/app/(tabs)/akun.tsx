import { useCallback, useState } from "react";
import { Redirect, useFocusEffect } from "expo-router";
import Constants from "expo-constants";
import { StyleSheet, Text, View } from "react-native";
import { InfoRow } from "@/components/info-row";
import {
  Badge,
  Card,
  ErrorNote,
  Loading,
  Screen,
  ScreenTitle,
  SecondaryButton,
} from "@/components/ui";
import { useDriver } from "@/lib/driver";
import {
  loadRatingSummary,
  type RatingSummary,
} from "@/lib/data/driver";
import { formatDateTime } from "@/lib/format";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { colors, space } from "@/lib/theme";

export default function AccountScreen() {
  const { session, loading: sessionLoading } = useSession();
  const { driver, loading: driverLoading, refresh } = useDriver();

  if (sessionLoading || driverLoading) {
    return <Loading label="Menyiapkan akun..." />;
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
    <AccountContent
      driverId={driver.id}
      email={session.user.email ?? "-"}
      vehicleType={driver.vehicle_type}
      plate={driver.vehicle_plate}
      registeredAt={driver.created_at}
      refresh={refresh}
    />
  );
}

function AccountContent({
  driverId,
  email,
  vehicleType,
  plate,
  registeredAt,
  refresh,
}: {
  driverId: string;
  email: string;
  vehicleType: "motor" | "mobil";
  plate: string | null;
  registeredAt: string;
  refresh: () => Promise<void>;
}) {
  const [summary, setSummary] = useState<RatingSummary>({
    count: 0,
    average: null,
  });
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const load = useCallback(async () => {
    const [result] = await Promise.all([
      loadRatingSummary(driverId),
      refresh(),
    ]);

    setSummary(result.summary);
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

  async function handleSignOut() {
    if (signingOut || !supabase) return;
    setSigningOut(true);
    await supabase.auth.signOut();
    setSigningOut(false);
  }

  const averageText =
    summary.average === null
      ? "-"
      : `${String(summary.average).replace(".", ",")} / 5`;

  return (
    <Screen onRefresh={handleRefresh} refreshing={refreshing}>
      <ScreenTitle
        subtitle="Data kendaraan dan penilaian pelanggan."
        title="Akun"
      />

      {error ? <ErrorNote message={error} /> : null}

      <Card>
        <View style={styles.head}>
          <Text style={styles.name}>Driver Godiand</Text>
          <Badge label="Terverifikasi" tone="mint" />
        </View>

        <InfoRow label="Email" value={email} />
        <InfoRow
          label="Kendaraan"
          value={vehicleType === "motor" ? "Motor" : "Mobil"}
        />
        <InfoRow label="Plat" value={plate ?? "-"} />
        <InfoRow label="Terdaftar" value={formatDateTime(registeredAt)} />
        <InfoRow label="ID driver" value={driverId.slice(0, 8).toUpperCase()} />

        <Text style={styles.muted}>
          Untuk mengubah data kendaraan, hubungi admin Godiand.
        </Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Penilaian</Text>

        {loadingData ? (
          <Loading label="Memuat penilaian..." />
        ) : (
          <>
            <Text style={styles.score}>{averageText}</Text>
            <Text style={styles.muted}>
              {summary.count === 0
                ? "Belum ada penilaian dari pelanggan."
                : `${summary.count} penilaian dari pelanggan.`}
            </Text>
          </>
        )}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Aplikasi</Text>
        <InfoRow
          label="Versi"
          value={Constants.expoConfig?.version ?? "0.1.0"}
        />
        <Text style={styles.muted}>
          Godiand Driver untuk Banda Aceh. Jangan bagikan kode OTP email ke
          siapa pun.
        </Text>
      </Card>

      <SecondaryButton
        disabled={signingOut}
        label={signingOut ? "Keluar..." : "Keluar"}
        onPress={handleSignOut}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  name: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
  },
  cardTitle: {
    color: colors.ink900,
    fontSize: 16,
    fontWeight: "900",
  },
  score: {
    color: colors.brand700,
    fontSize: 26,
    fontWeight: "900",
  },
  muted: {
    color: colors.ink600,
    fontSize: 12,
    lineHeight: 18,
  },
});
