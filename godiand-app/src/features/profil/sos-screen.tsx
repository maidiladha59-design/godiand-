import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { BackLink } from "@/components/back-link";
import {
  Card,
  DangerButton,
  ErrorNote,
  InfoNote,
  Screen,
  SecondaryButton,
} from "@/components/ui";
import { support, whatsappLink } from "@/lib/site";
import { colors, radius, space } from "@/lib/theme";

export function SosScreen() {
  const [linkError, setLinkError] = useState("");

  function openUrl(url: string, label: string) {
    setLinkError("");
    Linking.openURL(url).catch(() => {
      setLinkError(`${label} belum bisa dibuka di perangkat ini.`);
    });
  }

  return (
    <Screen>
      <BackLink />

      <View style={styles.head}>
        <Text style={styles.eyebrow}>Profil</Text>
        <Text style={styles.title}>Darurat SOS</Text>
        <Text style={styles.subtitle}>
          Kalau keselamatanmu terancam, hubungi bantuan sekarang. Jangan
          menunggu.
        </Text>
      </View>

      <Card>
        <View style={styles.badgeRow}>
          <View style={styles.iconBox}>
            <Ionicons
              color={colors.coral700}
              name="warning-outline"
              size={28}
            />
          </View>
          <View style={styles.badgeText}>
            <Text style={styles.badgeTitle}>Butuh bantuan darurat?</Text>
            <Text style={styles.badgeBody}>
              Telepon 112 kalau ada bahaya nyawa, kecelakaan, atau kejahatan.
            </Text>
          </View>
        </View>

        <DangerButton
          label="Telepon 112"
          onPress={() => openUrl(`tel:${support.emergencyNumber}`, "Telepon")}
        />

        <SecondaryButton
          label="WhatsApp admin"
          onPress={() =>
            openUrl(
              whatsappLink("Halo GoDiand, saya butuh bantuan darurat."),
              "WhatsApp admin",
            )
          }
        />

        {linkError ? <ErrorNote message={linkError} /> : null}
      </Card>

      <InfoNote message="112 adalah nomor darurat nasional. Saat menelepon, sebutkan lokasimu dengan jelas." />
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
  badgeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.md,
  },
  iconBox: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.md,
    backgroundColor: colors.coral50,
  },
  badgeText: {
    flex: 1,
    gap: 3,
  },
  badgeTitle: {
    color: colors.ink900,
    fontSize: 17,
    fontWeight: "900",
  },
  badgeBody: {
    color: colors.ink700,
    fontSize: 13,
    lineHeight: 20,
  },
});
