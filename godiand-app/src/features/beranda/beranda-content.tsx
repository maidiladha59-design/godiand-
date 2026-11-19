import { StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/app-screen";
import { ServiceGrid } from "@/components/service-grid";
import { SosButton } from "@/components/sos-button";
import { BrandHeader } from "@/components/ui";
import { colors, space } from "@/lib/theme";

export function BerandaContent({ displayName }: { displayName: string }) {
  return (
    <AppScreen active="beranda">
      <BrandHeader />

      <View style={styles.greetingRow}>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Halo, {displayName}</Text>
          <Text style={styles.greetingSubtitle}>
            Mau ke mana hari ini?
          </Text>
        </View>
        <SosButton />
      </View>

      <View style={styles.chips}>
        <View style={[styles.chip, styles.chipSun]}>
          <Text style={styles.chipText}>Mulai Rp9.000</Text>
        </View>
        <View style={[styles.chip, styles.chipWhite]}>
          <Text style={styles.chipText}>Tunai / QRIS</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Layanan</Text>
          <Text style={styles.sectionMeta}>6 layanan</Text>
        </View>
        <ServiceGrid />
        <Text style={styles.sectionNote}>
          GoDiandRide sudah bisa dipesan. Lima layanan lain menyusul.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
  },
  greeting: {
    flex: 1,
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
    borderRadius: 999,
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
  sectionHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
  },
  sectionMeta: {
    color: colors.ink500,
    fontSize: 12,
    fontWeight: "700",
  },
  sectionNote: {
    color: colors.ink500,
    fontSize: 12,
    lineHeight: 18,
  },
});
