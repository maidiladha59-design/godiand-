import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { services, type ServiceInfo } from "@/lib/services";
import { colors, hardShadow, radius, space } from "@/lib/theme";

const accentColors: Record<ServiceInfo["accent"], string> = {
  brand: colors.brand50,
  sun: colors.sun50,
  coral: colors.coral50,
  mint: colors.mint50,
  grape: colors.grape50,
  mist: colors.mist,
};

export function ServiceGrid() {
  return (
    <View style={styles.grid}>
      {services.map((service) => (
        <Pressable
          accessibilityLabel={`Pesan ${service.label}`}
          accessibilityRole="button"
          key={service.key}
          onPress={() => router.push(`/pesan/${service.key}`)}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
          <View
            style={[
              styles.monogram,
              { backgroundColor: accentColors[service.accent] },
            ]}
          >
            <Text style={styles.monogramText}>{service.monogram}</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={styles.label}>{service.label}</Text>
            <Text style={styles.tagline} numberOfLines={2}>
              {service.tagline}
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.md,
  },
  card: {
    flexBasis: "47%",
    flexGrow: 1,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: space.md,
    gap: space.sm,
    ...hardShadow,
  },
  cardPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOpacity: 1,
    elevation: 2,
  },
  monogram: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  monogramText: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
  },
  cardText: {
    gap: 2,
  },
  label: {
    color: colors.ink900,
    fontSize: 16,
    fontWeight: "900",
  },
  tagline: {
    color: colors.ink600,
    fontSize: 12,
    lineHeight: 17,
  },
  arrow: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
    alignSelf: "flex-end",
  },
});
