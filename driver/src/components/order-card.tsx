import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui";
import type { AssignedOrderSummary } from "@/lib/data/orders";
import { formatDateTime, formatKm, formatRupiah } from "@/lib/format";
import { serviceLabel } from "@/lib/services";
import { colors, space } from "@/lib/theme";

export function OrderCard({ order }: { order: AssignedOrderSummary }) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityLabel={`Buka pesanan ${serviceLabel(order.service_type)}`}
      accessibilityRole="button"
      onPress={() => router.push(`/pesanan/${order.id}`)}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card style={styles.card}>
        <View style={styles.head}>
          <Text style={styles.title}>{serviceLabel(order.service_type)}</Text>
          <StatusBadge status={order.status} />
        </View>

        <View style={styles.route}>
          <Text numberOfLines={2} style={styles.address}>
            Dari: {order.pickup_address ?? "-"}
          </Text>
          <Text numberOfLines={2} style={styles.address}>
            Ke: {order.dropoff_address ?? "-"}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>{formatDateTime(order.created_at)}</Text>
          <Text style={styles.meta}>
            {formatKm(order.distance_km)} · {formatRupiah(order.total_amount)}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  card: {
    padding: space.lg,
    gap: space.sm,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
  },
  title: {
    color: colors.ink900,
    fontSize: 17,
    fontWeight: "900",
  },
  route: {
    gap: 2,
  },
  address: {
    color: colors.ink700,
    fontSize: 13,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.brand100,
    paddingTop: space.sm,
  },
  meta: {
    color: colors.ink500,
    fontSize: 11,
    fontWeight: "600",
  },
});
