import { Alert, Linking, StyleSheet, Text, View } from "react-native";
import { ServiceGrid } from "@/components/service-grid";
import {
  BrandHeader,
  Card,
  DangerButton,
  Screen,
  SecondaryButton,
} from "@/components/ui";
import { colors, radius, space } from "@/lib/theme";

function handleSos() {
  Alert.alert(
    "SOS darurat",
    "Kamu akan diarahkan ke panggilan darurat 112. Lanjutkan?",
    [
      { text: "Batal", style: "cancel" },
      {
        text: "Telepon 112",
        style: "destructive",
        onPress: () => {
          Linking.openURL("tel:112").catch(() => {
            Alert.alert(
              "Tidak bisa membuka panggilan",
              "Coba telepon 112 secara manual ya.",
            );
          });
        },
      },
    ],
  );
}

export function BerandaContent({
  displayName,
  signingOut,
  onSignOut,
}: {
  displayName: string;
  signingOut: boolean;
  onSignOut: () => void;
}) {
  return (
    <Screen>
      <BrandHeader />

      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Halo, {displayName}</Text>
        <Text style={styles.greetingSubtitle}>
          Mau pakai layanan apa hari ini?
        </Text>
      </View>

      <View style={styles.chips}>
        <View style={[styles.chip, styles.chipSun]}>
          <Text style={styles.chipText}>Mulai Rp9.000</Text>
        </View>
        <View style={[styles.chip, styles.chipWhite]}>
          <Text style={styles.chipText}>Tunai/QRIS</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Layanan</Text>
        <ServiceGrid />
        <Text style={styles.sectionNote}>
          Alur pesan aktif bertahap. Kartu bertanda “Segera hadir” belum bisa
          dipesan.
        </Text>
      </View>

      <Card style={styles.sosCard}>
        <Text style={styles.sosTitle}>Butuh bantuan cepat?</Text>
        <Text style={styles.sosBody}>
          SOS langsung membuka panggilan darurat 112.
        </Text>
        <DangerButton label="SOS Darurat" onPress={handleSos} />
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footnote}>GoDiand · Banda Aceh</Text>
        <SecondaryButton
          disabled={signingOut}
          label={signingOut ? "Keluar..." : "Keluar"}
          onPress={onSignOut}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: {
    gap: 2,
  },
  greetingText: {
    color: colors.ink900,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  greetingSubtitle: {
    color: colors.ink600,
    fontSize: 14,
    lineHeight: 20,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
  chip: {
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: 7,
  },
  chipSun: {
    backgroundColor: colors.sun400,
  },
  chipWhite: {
    backgroundColor: colors.white,
  },
  chipText: {
    color: colors.ink900,
    fontSize: 12,
    fontWeight: "900",
  },
  section: {
    gap: space.md,
  },
  sectionTitle: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
  },
  sectionNote: {
    color: colors.ink500,
    fontSize: 12,
    lineHeight: 18,
  },
  sosCard: {
    borderColor: colors.coral600,
  },
  sosTitle: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
  },
  sosBody: {
    color: colors.ink600,
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    gap: space.sm,
  },
  footnote: {
    color: colors.ink500,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});
