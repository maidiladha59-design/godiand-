import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, space } from "@/lib/theme";

const items = [
  { key: "beranda", label: "Beranda", href: "/" },
  { key: "riwayat", label: "Riwayat", href: "/riwayat" },
  { key: "akun", label: "Akun", href: "/akun" },
] as const;

export type TabKey = (typeof items)[number]["key"];

export function BottomNav({ active }: { active: TabKey }) {
  const router = useRouter();

  return (
    <View style={styles.bar}>
      {items.map((item) => {
        const selected = item.key === active;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={item.key}
            onPress={() => {
              if (!selected) router.replace(item.href);
            }}
            style={({ pressed }) => [
              styles.item,
              selected && styles.itemActive,
              pressed && !selected && styles.itemPressed,
            ]}
          >
            <Text style={[styles.label, selected && styles.labelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    gap: space.sm,
    borderTopWidth: 2,
    borderTopColor: colors.ink900,
    backgroundColor: colors.white,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  item: {
    flex: 1,
    minHeight: 44,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.sm,
  },
  itemActive: {
    borderColor: colors.ink900,
    backgroundColor: colors.brand600,
  },
  itemPressed: {
    backgroundColor: colors.sun50,
  },
  label: {
    color: colors.ink600,
    fontSize: 14,
    fontWeight: "800",
  },
  labelActive: {
    color: colors.white,
  },
});
