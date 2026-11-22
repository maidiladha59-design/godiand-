import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BackLink } from "@/components/back-link";
import {
  Card,
  DangerButton,
  ErrorNote,
  Field,
  Screen,
} from "@/components/ui";
import { deleteMyAccount } from "@/lib/account";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { colors, radius, space } from "@/lib/theme";

export function HapusAkunScreen() {
  const router = useRouter();
  const { session } = useSession();
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const canDelete = confirmation.trim().toUpperCase() === "HAPUS" && !busy;
  const email = session?.user.email ?? "-";

  async function handleDelete() {
    if (!canDelete) return;

    setBusy(true);
    setError("");

    try {
      await deleteMyAccount();
    } catch (cause) {
      setBusy(false);
      setError(
        cause instanceof Error
          ? cause.message
          : "Akun belum bisa dihapus. Coba lagi nanti.",
      );
      return;
    }

    try {
      await supabase?.auth.signOut();
    } catch {
      // Akun sudah terhapus; lanjut ke halaman masuk.
    }

    router.replace("/masuk");
  }

  return (
    <Screen>
      <BackLink />

      <View style={styles.head}>
        <Text style={styles.eyebrow}>Profil</Text>
        <Text style={styles.title}>Hapus akun</Text>
        <Text style={styles.subtitle}>
          Kamu akan keluar dari GoDiand dan akun ini dihapus permanen.
        </Text>
      </View>

      <Card>
        <View style={styles.warningBox}>
          <View style={styles.warningIcon}>
            <Ionicons
              color={colors.coral700}
              name="warning-outline"
              size={22}
            />
          </View>
          <View style={styles.warningText}>
            <Text style={styles.warningTitle}>Yang ikut terhapus</Text>
            <Text style={styles.warningBody}>
              Data akun, pesanan, dan riwayat pesananmu di GoDiand.
            </Text>
          </View>
        </View>

        <View style={styles.points}>
          <View style={styles.point}>
            <View style={styles.dot} />
            <Text style={styles.pointText}>
              Tindakan ini tidak bisa dibatalkan.
            </Text>
          </View>
          <View style={styles.point}>
            <View style={styles.dot} />
            <Text style={styles.pointText}>
              Kamu masih bisa daftar lagi dengan email yang sama kapan saja.
            </Text>
          </View>
          <View style={styles.point}>
            <View style={styles.dot} />
            <Text style={styles.pointText}>
              Pesanan yang sedang berjalan sebaiknya diselesaikan dulu.
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.confirmTitle}>Konfirmasi hapus akun</Text>
        <Text style={styles.confirmBody}>
          Ketik HAPUS untuk menghapus akun {email}.
        </Text>

        <Field
          autoCapitalize="characters"
          center
          label="Ketik HAPUS"
          maxLength={5}
          onChangeText={(value) => {
            setConfirmation(value);
            setError("");
          }}
          placeholder="HAPUS"
          value={confirmation}
        />

        {error ? <ErrorNote message={error} /> : null}

        <DangerButton
          disabled={!canDelete}
          label="Hapus akun saya"
          loading={busy}
          onPress={() => {
            void handleDelete();
          }}
        />
      </Card>
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
    marginTop: 2,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.md,
    borderWidth: 2,
    borderColor: colors.coral600,
    borderRadius: radius.md,
    backgroundColor: colors.coral50,
    padding: space.md,
  },
  warningIcon: {
    paddingTop: 1,
  },
  warningText: {
    flex: 1,
    gap: 2,
  },
  warningTitle: {
    color: colors.coral700,
    fontSize: 14,
    fontWeight: "900",
  },
  warningBody: {
    color: colors.coral700,
    fontSize: 13,
    lineHeight: 19,
  },
  points: {
    gap: space.sm,
  },
  point: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.ink900,
    marginTop: 7,
  },
  pointText: {
    flex: 1,
    color: colors.ink700,
    fontSize: 13,
    lineHeight: 20,
  },
  confirmTitle: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
  },
  confirmBody: {
    color: colors.ink600,
    fontSize: 14,
    lineHeight: 21,
  },
});
