import { StyleSheet, Text, View } from "react-native";
import { Card, PrimaryButton } from "@/components/ui";
import type { AvailableOrder } from "@/lib/data/orders";
import { formatDateTime, formatKm, formatRupiah } from "@/lib/format";
import { serviceLabel } from "@/lib/services";
import { colors, space } from "@/lib/theme";

export function AvailableOrderCard({
  order,
  accepting,
  onAccept,
  disabled,
}: {
  order: AvailableOrder;
  accepting: boolean;
  onAccept: () => void;
  disabled: boolean;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>{serviceLabel(order.service_type)}</Text>
        <Text style={styles.fare}>{formatRupiah(order.delivery_fee)}</Text>
      </View>

      <View style={styles.route}>
        <Text style={styles.addressLabel}>Jemput</Text>
        <Text style={styles.address}>{order.pickup_address ?? "-"}</Text>
        <Text style={styles.addressLabel}>Antar</Text>
        <Text style={styles.address}>{order.dropoff_address ?? "-"}</Text>
      </View>

      {order.notes ? (
        <View style={styles.notesBox}>
          <Text style={styles.notesLabel}>Catatan</Text>
          <Text style={styles.notes}>{order.notes}</Text>
        </View>
      ) : null}

      <View style={styles.metaRow}>
        <Text style={styles.meta}>{formatKm(order.distance_km)}</Text>
        <Text style={styles.meta}>
          Total {formatRupiah(order.total_amount)}
        </Text>
      </View>

      {order.scheduled_at ? (
        <Text style={styles.meta}>
          Dijadwalkan {formatDateTime(order.scheduled_at)}
        </Text>
      ) : (
        <Text style={styles.meta}>
          Masuk {formatDateTime(order.created_at)}
        </Text>
      )}

      <PrimaryButton
        disabled={disabled}
        label="Ambil pesanan"
        loading={accepting}
        onPress={onAccept}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
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
  fare: {
    color: colors.brand700,
    fontSize: 17,
    fontWeight: "900",
  },
  route: {
    gap: 2,
  },
  addressLabel: {
    color: colors.ink500,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  address: {
    color: colors.ink900,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  notesBox: {
    borderLeftWidth: 3,
    borderLeftColor: colors.brand200,
    paddingLeft: space.sm,
    gap: 1,
  },
  notesLabel: {
    color: colors.ink500,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  notes: {
    color: colors.ink700,
    fontSize: 12,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
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
