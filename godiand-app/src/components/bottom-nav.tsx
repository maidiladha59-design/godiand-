import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, hardShadow, radius, space } from "@/lib/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type NavItem = {
  key: "beranda" | "aktivitas" | "notifikasi" | "profil";
  label: string;
  href: "/" | "/aktivitas" | "/notifikasi" | "/profil";
  icon: IoniconName;
  iconActive: IoniconName;
};

const items: NavItem[] = [
  {
    key: "beranda",
    label: "Beranda",
    href: "/",
    icon: "home-outline",
    iconActive: "home",
  },
  {
    key: "aktivitas",
    label: "Aktivitas",
    href: "/aktivitas",
    icon: "receipt-outline",
    iconActive: "receipt",
  },
  {
    key: "notifikasi",
    label: "Notifikasi",
    href: "/notifikasi",
    icon: "notifications-outline",
    iconActive: "notifications",
  },
  {
    key: "profil",
    label: "Profil",
    href: "/profil",
    icon: "person-outline",
    iconActive: "person",
  },
];

export type TabKey = NavItem["key"];

export function BottomNav({ active }: { active: TabKey }) {
  const router = useRouter();

  return (
    <View pointerEvents="box-none" style={styles.dock}>
      <View style={styles.bar}>
        {items.map((item) => {
          const selected = item.key === active;
          return (
            <Pressable
              accessibilityLabel={item.label}
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
              <Ionicons
                color={selected ? colors.ink900 : colors.ink600}
                name={selected ? item.iconActive : item.icon}
                size={20}
              />
              <Text
                numberOfLines={1}
                style={[styles.label, selected && styles.labelActive]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.sm,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    padding: 5,
    ...hardShadow,
  },
  item: {
    flex: 1,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: radius.pill,
    paddingHorizontal: 2,
    paddingVertical: 6,
  },
  itemActive: {
    borderColor: colors.ink900,
    backgroundColor: colors.sun400,
  },
  itemPressed: {
    backgroundColor: colors.sun50,
  },
  label: {
    color: colors.ink600,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.1,
  },
  labelActive: {
    color: colors.ink900,
  },
});
