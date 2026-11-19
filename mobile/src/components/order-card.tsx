import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBadge } from "@/components/status-badge";
import type { OrderSummary } from "@/lib/data/orders";
import { formatDateTime, formatKm, formatRupiah } from "@/lib/format";
import { serviceLabel } from "@/lib/services";
import { colors, hardShadow, radius, space } from "@/lib/theme";

export function OrderCard({ order }: { order: OrderSummary }) {
  return (
    <Pressable
      accessibilityLabel={`Buka pesanan ${serviceLabel(order.service_type)}`}
      accessibilityRole="button"
      onPress={() => router.push(`/pesanan/${order.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.top}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{serviceLabel(order.service_type)}</Text>
          <Text style={styles.date}>{formatDateTime(order.created_at)}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      {order.pickup_address ? (
        <Text numberOfLines={1} style={styles.route}>
          Dari: {order.pickup_address}
        </Text>
      ) : null}

      {order.dropoff_address ? (
        <Text numberOfLines={1} style={styles.route}>
          Ke: {order.dropoff_address}
        </Text>
      ) : null}

      <View style={styles.bottom}>
        <Text style={styles.distance}>{formatKm(order.distance_km)}</Text>
        <Text style={styles.total}>{formatRupiah(order.total_amount)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: space.md,
    gap: 6,
    ...hardShadow,
  },
  cardPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    elevation: 2,
  },
  top: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.sm,
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.ink900,
    fontSize: 16,
    fontWeight: "900",
  },
  date: {
    color: colors.ink500,
    fontSize: 12,
  },
  route: {
    color: colors.ink700,
    fontSize: 13,
    lineHeight: 19,
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  distance: {
    color: colors.ink600,
    fontSize: 12,
    fontWeight: "700",
  },
  total: {
    color: colors.brand700,
    fontSize: 15,
    fontWeight: "900",
  },
});
