import { useState } from "react";
import { Redirect } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import {
  Badge,
  Card,
  Loading,
  Screen,
  ScreenTitle,
  SecondaryButton,
} from "@/components/ui";
import { useDriver } from "@/lib/driver";
import { formatDateTime } from "@/lib/format";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { colors, space } from "@/lib/theme";

export default function VerificationScreen() {
  const { session, loading: sessionLoading } = useSession();
  const { driver, loading: driverLoading, refresh } = useDriver();
  const [checking, setChecking] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (sessionLoading || driverLoading) {
    return <Loading label="Memeriksa status driver..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  if (!driver) {
    return <Redirect href="/daftar" />;
  }

  if (driver.is_verified) {
    return <Redirect href="/" />;
  }

  async function handleRefresh() {
    if (checking) return;
    setChecking(true);
    await refresh();
    setChecking(false);
  }

  async function handleSignOut() {
    if (signingOut || !supabase) return;
    setSigningOut(true);
    await supabase.auth.signOut();
    setSigningOut(false);
  }

  return (
    <Screen>
      <ScreenTitle
        subtitle="Akun driver perlu disetujui sebelum bisa mengambil pesanan."
        title="Menunggu verifikasi"
      />

      <Card>
        <View style={styles.head}>
          <Text style={styles.name}>Data driver</Text>
          <Badge label="Belum terverifikasi" tone="sun" />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Kendaraan</Text>
          <Text style={styles.value}>
            {driver.vehicle_type === "motor" ? "Motor" : "Mobil"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Plat</Text>
          <Text style={styles.value}>{driver.vehicle_plate ?? "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{session.user.email ?? "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Didaftarkan</Text>
          <Text style={styles.value}>{formatDateTime(driver.created_at)}</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.infoTitle}>Apa selanjutnya?</Text>
        <Text style={styles.infoText}>
          Admin Godiand akan memeriksa data kendaraanmu. Setelah disetujui,
          status di halaman ini berubah dan kamu bisa mulai mencari pesanan.
        </Text>
        <SecondaryButton
          disabled={checking || signingOut}
          label={checking ? "Memeriksa..." : "Muat ulang status"}
          onPress={handleRefresh}
        />
        <SecondaryButton
          disabled={checking || signingOut}
          label={signingOut ? "Keluar..." : "Keluar"}
          onPress={handleSignOut}
        />
      </Card>
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
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.md,
  },
  label: {
    color: colors.ink500,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  value: {
    flex: 1,
    textAlign: "right",
    color: colors.ink900,
    fontSize: 13,
    fontWeight: "600",
  },
  infoTitle: {
    color: colors.ink900,
    fontSize: 16,
    fontWeight: "900",
  },
  infoText: {
    color: colors.ink600,
    fontSize: 13,
    lineHeight: 19,
  },
});
