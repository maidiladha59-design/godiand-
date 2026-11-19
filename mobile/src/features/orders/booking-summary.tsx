import { StyleSheet, Text, View } from "react-native";
import {
  Card,
  ErrorNote,
  PrimaryButton,
} from "@/components/ui";
import { formatKm, formatRupiah } from "@/lib/format";
import { colors, space } from "@/lib/theme";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function BookingSummary({
  distance,
  fare,
  fareLoading,
  fareError,
  itemsTotal,
  itemCount,
  formError,
  submitting,
  onSubmit,
}: {
  distance: number | null;
  fare: number | null;
  fareLoading: boolean;
  fareError: string;
  itemsTotal: number;
  itemCount: number;
  formError: string;
  submitting: boolean;
  onSubmit: () => void;
}) {
  const fareText = fareLoading
    ? "Menghitung..."
    : fare !== null
      ? formatRupiah(fare)
      : "—";

  const total = fare !== null ? itemsTotal + fare : null;

  return (
    <Card>
      <Text style={styles.title}>Ringkasan</Text>

      <Row
        label="Jarak"
        value={distance !== null ? formatKm(distance) : "Belum dipilih"}
      />
      <Row label="Ongkir" value={fareText} />

      {itemsTotal > 0 ? (
        <Row
          label={`Menu (${itemCount} item)`}
          value={formatRupiah(itemsTotal)}
        />
      ) : null}

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalLabel}>Perkiraan total</Text>
        <Text style={styles.totalValue}>
          {total !== null ? formatRupiah(total) : "—"}
        </Text>
      </View>

      <Text style={styles.hint}>
        Tarif akhir dihitung server dari jarak titik yang kamu pilih.
      </Text>

      {fareError ? <ErrorNote message={fareError} /> : null}
      {formError ? <ErrorNote message={formError} /> : null}

      <PrimaryButton
        label="Pesan sekarang"
        loading={submitting}
        onPress={onSubmit}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.ink900,
    fontSize: 16,
    fontWeight: "900",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
  },
  rowLabel: {
    color: colors.ink600,
    fontSize: 13,
  },
  rowValue: {
    color: colors.ink900,
    fontSize: 14,
    fontWeight: "700",
  },
  divider: {
    borderTopWidth: 2,
    borderTopColor: colors.ink900,
  },
  totalLabel: {
    color: colors.ink900,
    fontSize: 15,
    fontWeight: "900",
  },
  totalValue: {
    color: colors.brand700,
    fontSize: 20,
    fontWeight: "900",
  },
  hint: {
    color: colors.ink600,
    fontSize: 12,
    lineHeight: 18,
  },
});
