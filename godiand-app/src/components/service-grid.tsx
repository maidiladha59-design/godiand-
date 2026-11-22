import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { services, type ServiceAccent } from "@/lib/services";
import { colors, hardShadow, radius, space } from "@/lib/theme";

const accentColors: Record<ServiceAccent, string> = {
  brand: colors.brand100,
  sun: colors.sun50,
  coral: colors.coral50,
  mint: colors.mint50,
  grape: colors.grape50,
  mist: colors.mist,
};

export function ServiceGrid() {
  const router = useRouter();

  return (
    <View style={styles.grid}>
      {services.map((service) => {
        const ride = !service.comingSoon;
        const tileColor = ride ? colors.brand600 : accentColors[service.accent];

        return (
          <Pressable
            accessibilityLabel={`${service.label}${
              service.comingSoon ? " — segera hadir" : " — pesan sekarang"
            }`}
            accessibilityRole="button"
            key={service.key}
            onPress={() => {
              if (service.comingSoon) {
                Alert.alert(
                  `${service.label} segera hadir`,
                  "Layanan ini belum aktif. Kami kabari kalau sudah siap ya.",
                );
                return;
              }
              router.push("/ride");
            }}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={[styles.tile, { backgroundColor: tileColor }]}>
              <Ionicons
                color={ride ? colors.white : colors.ink900}
                name={service.icon}
                size={22}
              />
            </View>
            <Text numberOfLines={2} style={styles.label}>
              {service.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    flexBasis: "30%",
    flexGrow: 1,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: space.sm,
    paddingVertical: space.md,
    ...hardShadow,
  },
  cardPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    elevation: 2,
  },
  tile: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.sm,
  },
  label: {
    color: colors.ink900,
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: -0.2,
    textAlign: "center",
    lineHeight: 13,
  },
});
