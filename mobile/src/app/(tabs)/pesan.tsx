import { StyleSheet, Text } from "react-native";
import { ServiceGrid } from "@/components/service-grid";
import { InfoNote, Screen, ScreenTitle } from "@/components/ui";
import { colors } from "@/lib/theme";

export default function PesanScreen() {
  return (
    <Screen>
      <ScreenTitle
        subtitle="Pilih layanan. Tarif dihitung dari jarak dan tarif aktif."
        title="Pesan"
      />

      <ServiceGrid />

      <InfoNote message="Titik jemput dan tujuan diambil dari daftar lokasi Godiand. Tarif akhir selalu dihitung ulang oleh server." />

      <Text style={styles.footnote}>
        Makan, laundry, dan mart aktif setelah toko terdaftar dan diverifikasi.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footnote: {
    color: colors.ink500,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
