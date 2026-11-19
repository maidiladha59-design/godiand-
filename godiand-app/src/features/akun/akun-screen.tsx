import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppScreen } from "@/components/app-screen";
import { Card, SecondaryButton } from "@/components/ui";
import { useSession } from "@/lib/session";
import { legalLinks } from "@/lib/site";
import { supabase } from "@/lib/supabase";
import { colors, radius, space } from "@/lib/theme";

function openLink(url: string, label: string) {
  Linking.openURL(url).catch(() => {
    Alert.alert(
      "Tautan belum bisa dibuka",
      `${label} belum bisa dibuka di perangkat ini.`,
    );
  });
}

function LinkRow({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
    >
      <Text style={styles.linkLabel}>{label}</Text>
      <Text style={styles.linkArrow}>›</Text>
    </Pressable>
  );
}

export function AkunScreen() {
  const { session } = useSession();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const email = session?.user.email ?? "-";
  const rawName = session?.user.user_metadata?.name;
  const rawPhone = session?.user.user_metadata?.phone;
  const name =
    typeof rawName === "string" && rawName.trim()
      ? rawName.trim()
      : (session?.user.email?.split("@")[0] ?? "Warga Banda Aceh");
  const phone =
    typeof rawPhone === "string" && rawPhone.trim() ? rawPhone.trim() : null;
  const initial = name.trim().charAt(0).toUpperCase() || "G";
  const version = Constants.expoConfig?.version ?? "0.1.0";

  function confirmSignOut() {
    Alert.alert("Keluar dari GoDiand?", "Kamu bisa masuk lagi pakai email.", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: () => {
          if (!supabase || signingOut) return;
          setSigningOut(true);
          supabase.auth
            .signOut()
            .catch(() => {})
            .finally(() => {
              setSigningOut(false);
              router.replace("/masuk");
            });
        },
      },
    ]);
  }

  return (
    <AppScreen active="akun">
      <Text style={styles.title}>Akun</Text>

      <Card>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>
        </View>
        <View style={styles.meta}>
          <Text style={styles.metaLabel}>Nomor HP</Text>
          <Text style={styles.metaValue}>{phone ?? "Belum diisi"}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.metaLabel}>Metode masuk</Text>
          <Text style={styles.metaValue}>Email + kode OTP</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Bantuan & legal</Text>
        <LinkRow
          label="Syarat Layanan"
          onPress={() => openLink(legalLinks.terms, "Syarat Layanan")}
        />
        <LinkRow
          label="Kebijakan Privasi"
          onPress={() => openLink(legalLinks.privacy, "Kebijakan Privasi")}
        />
      </Card>

      <Card>
        <Text style={styles.metaLabel}>Versi aplikasi {version}</Text>
        <SecondaryButton
          disabled={signingOut}
          label={signingOut ? "Keluar..." : "Keluar"}
          onPress={confirmSignOut}
        />
      </Card>
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
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.md,
    backgroundColor: colors.sun400,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.ink900,
    fontSize: 24,
    fontWeight: "900",
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
  },
  email: {
    color: colors.ink600,
    fontSize: 13,
    lineHeight: 19,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.brand100,
    paddingTop: space.md,
  },
  metaLabel: {
    color: colors.ink500,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  metaValue: {
    color: colors.ink900,
    fontSize: 14,
    fontWeight: "800",
  },
  cardTitle: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.brand100,
    paddingTop: space.md,
    paddingBottom: space.xs,
  },
  linkRowPressed: {
    opacity: 0.6,
  },
  linkLabel: {
    color: colors.brand700,
    fontSize: 15,
    fontWeight: "800",
  },
  linkArrow: {
    color: colors.ink500,
    fontSize: 20,
    fontWeight: "800",
  },
});
