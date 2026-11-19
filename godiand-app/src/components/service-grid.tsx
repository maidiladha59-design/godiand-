import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { services, type ServiceAccent } from "@/lib/services";
import { colors, hardShadow, radius, space } from "@/lib/theme";

const accentColors: Record<ServiceAccent, string> = {
  brand: colors.brand50,
  sun: colors.sun50,
  coral: colors.coral50,
  mint: colors.mint50,
  grape: colors.grape50,
  mist: colors.mist,
};

function comingSoonMessage(label: string) {
  Alert.alert(
    `${label} segera hadir`,
    "Layanan ini belum aktif. Kami kabari kalau sudah siap ya.",
  );
}

function rideMessage() {
  Alert.alert(
    "Pesan Ride",
    "Alur pesan Ride sedang disiapkan. Sebentar lagi ya.",
  );
}

export function ServiceGrid() {
  return (
    <View style={styles.grid}>
      {services.map((service) => (
        <Pressable
          accessibilityLabel={`${service.label}${
            service.comingSoon ? " — segera hadir" : ""
          }`}
          accessibilityRole="button"
          key={service.key}
          onPress={() => {
            if (service.comingSoon) {
              comingSoonMessage(service.label);
            } else {
              rideMessage();
            }
          }}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
          <View style={styles.cardHead}>
            <View
              style={[
                styles.monogram,
                { backgroundColor: accentColors[service.accent] },
              ]}
            >
              <Text style={styles.monogramText}>{service.monogram}</Text>
            </View>
            {service.comingSoon ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Segera hadir</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.cardText}>
            <Text style={styles.label}>{service.label}</Text>
            <Text style={styles.tagline} numberOfLines={2}>
              {service.tagline}
            </Text>
          </View>
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
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.xs,
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
  badge: {
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.pill,
    backgroundColor: colors.sun50,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: colors.ink900,
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.3,
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
});
