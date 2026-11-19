import { StyleSheet, Text, View } from "react-native";
import { colors, space } from "@/lib/theme";

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    minWidth: 70,
  },
  value: {
    flex: 1,
    textAlign: "right",
    color: colors.ink900,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
});
