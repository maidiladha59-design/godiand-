import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MenuItem } from "@/lib/data/merchants";
import { formatRupiah } from "@/lib/format";
import { colors, radius, space } from "@/lib/theme";

export function MenuItemRow({
  item,
  quantity,
  onChange,
}: {
  item: MenuItem;
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  return (
    <View style={[styles.row, quantity > 0 && styles.rowActive]}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.description}>{item.description}</Text>
        ) : null}
        <Text style={styles.price}>{formatRupiah(item.price)}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityLabel={`Kurangi ${item.name}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: quantity === 0 }}
          disabled={quantity === 0}
          onPress={() => onChange(quantity - 1)}
          style={({ pressed }) => [
            styles.step,
            quantity === 0 && styles.stepDisabled,
            pressed && styles.stepPressed,
          ]}
        >
          <Text style={styles.stepText}>-</Text>
        </Pressable>

        <Text accessibilityLabel={`Jumlah ${item.name}`} style={styles.quantity}>
          {quantity}
        </Text>

        <Pressable
          accessibilityLabel={`Tambah ${item.name}`}
          accessibilityRole="button"
          onPress={() => onChange(quantity + 1)}
          style={({ pressed }) => [
            styles.step,
            pressed && styles.stepPressed,
          ]}
        >
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    padding: space.md,
  },
  rowActive: {
    backgroundColor: colors.brand50,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.ink900,
    fontSize: 14,
    fontWeight: "800",
  },
  description: {
    color: colors.ink600,
    fontSize: 12,
    lineHeight: 17,
  },
  price: {
    color: colors.brand700,
    fontSize: 13,
    fontWeight: "800",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  step: {
    width: 34,
    height: 34,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDisabled: {
    opacity: 0.4,
  },
  stepPressed: {
    backgroundColor: colors.sun50,
  },
  stepText: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 20,
  },
  quantity: {
    minWidth: 20,
    textAlign: "center",
    color: colors.ink900,
    fontSize: 15,
    fontWeight: "800",
  },
});
