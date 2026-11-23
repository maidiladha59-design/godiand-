import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Card,
  ErrorNote,
  InfoNote,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";
import {
  formatDistanceKm,
  formatRupiah,
  rideDistanceKm,
} from "@/lib/geo";
import type { PickedPlace } from "@/lib/places";
import {
  createRideOrder,
  fetchRideFare,
  paymentMethodLabel,
  type PaymentMethod,
} from "@/lib/ride-orders";
import { colors, radius, space } from "@/lib/theme";

type FareState =
  | { status: "loading" }
  | { status: "ready"; fare: number; distance: number }
  | { status: "error"; message: string };

const paymentOptions: { value: PaymentMethod; title: string; hint: string }[] = [
  { value: "cash", title: "Tunai", hint: "Bayar pas di tujuan" },
  { value: "qris", title: "QRIS", hint: "Scan QRIS driver" },
];

export function RideFareCard({
  pickup,
  destination,
  onOrdered,
}: {
  pickup: PickedPlace;
  destination: PickedPlace;
  onOrdered: (orderId: string) => void;
}) {
  const distance = useMemo(
    () => rideDistanceKm(pickup, destination),
    [pickup, destination],
  );
  const [fareState, setFareState] = useState<FareState>({ status: "loading" });
  const [fareAttempt, setFareAttempt] = useState(0);
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState("");
  const submitLock = useRef(false);

  useEffect(() => {
    let active = true;
    setFareState({ status: "loading" });
    setError("");

    fetchRideFare(distance)
      .then((fare) => {
        if (active) {
          setFareState({ status: "ready", fare, distance });
        }
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setFareState({
          status: "error",
          message:
            cause instanceof Error
              ? cause.message
              : "Tarif belum bisa dihitung. Coba lagi ya.",
        });
      });

    return () => {
      active = false;
    };
  }, [distance, fareAttempt]);

  async function handleOrder() {
    if (fareState.status !== "ready" || submitLock.current) return;

    submitLock.current = true;
    setOrdering(true);
    setError("");

    try {
      const order = await createRideOrder({
        pickupAddress: pickup.name,
        pickup: { latitude: pickup.latitude, longitude: pickup.longitude },
        dropoffAddress: destination.name,
        dropoff: {
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
        paymentMethod: payment,
      });

      onOrdered(order.id);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Pesanan belum bisa dibuat. Coba lagi ya.",
      );
    } finally {
      submitLock.current = false;
      setOrdering(false);
    }
  }

  const ready = fareState.status === "ready";

  return (
    <Card>
      <View style={styles.head}>
        <Text style={styles.title}>Estimasi tarif</Text>
        <Text style={styles.distance}>
          Estimasi {formatDistanceKm(distance)}
        </Text>
      </View>

      {distance > 25 ? (
        <InfoNote
          message={`Perjalanan ini sekitar ${formatDistanceKm(
            distance,
          )}. Cukup jauh untuk ojek, jadi tarifnya juga lebih besar. Pastikan kamu nyaman dulu ya.`}
        />
      ) : null}

      <View style={styles.route}>
        <View style={styles.routeRow}>
          <View style={styles.dotStart} />
          <Text numberOfLines={1} style={styles.routeText}>
            {pickup.name}
          </Text>
        </View>
        <View style={styles.routeRow}>
          <View style={styles.dotEnd} />
          <Text numberOfLines={1} style={styles.routeText}>
            {destination.name}
          </Text>
        </View>
      </View>

      {fareState.status === "loading" ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.brand600} />
          <Text style={styles.loadingText}>Menghitung tarif...</Text>
        </View>
      ) : null}

      {fareState.status === "error" ? (
        <>
          <ErrorNote message={fareState.message} />
          <SecondaryButton
            label="Coba hitung ulang"
            onPress={() => setFareAttempt((value) => value + 1)}
          />
        </>
      ) : null}

      {ready ? (
        <>
          <View style={styles.fareBox}>
            <Text style={styles.fareLabel}>Tarif</Text>
            <Text style={styles.fareValue}>
              {formatRupiah(fareState.fare)}
            </Text>
            <Text style={styles.fareHint}>
              Tarif ini yang dipakai saat kamu pesan. Tanpa saldo, tanpa
              top-up.
            </Text>
          </View>

          <View style={styles.payBlock}>
            <Text style={styles.payLabel}>Cara bayar</Text>
            <View style={styles.payRow}>
              {paymentOptions.map((option) => {
                const selected = payment === option.value;

                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    aria-checked={selected}
                    key={option.value}
                    onPress={() => setPayment(option.value)}
                    style={({ pressed }) => [
                      styles.payOption,
                      selected && styles.payOptionSelected,
                      pressed && !selected && styles.payOptionPressed,
                    ]}
                  >
                    <View
                      style={[styles.radio, selected && styles.radioSelected]}
                    >
                      {selected ? <View style={styles.radioDot} /> : null}
                    </View>
                    <View style={styles.payText}>
                      <Text style={styles.payTitle}>{option.title}</Text>
                      <Text style={styles.payHint}>{option.hint}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.payNote}>
              Bayar ke driver saat selesai — {paymentMethodLabel(payment)}.
              Tanpa saldo atau top-up.
            </Text>
          </View>

          {error ? <ErrorNote message={error} /> : null}

          <PrimaryButton
            label="Pesan sekarang"
            loading={ordering}
            onPress={handleOrder}
          />
        </>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.md,
  },
  title: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
  },
  distance: {
    color: colors.ink600,
    fontSize: 12,
    fontWeight: "800",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  loadingText: {
    color: colors.ink600,
    fontSize: 13,
    fontWeight: "600",
  },
  fareBox: {
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.md,
    backgroundColor: colors.sun50,
    padding: space.md,
    gap: 4,
  },
  fareLabel: {
    color: colors.ink600,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  fareValue: {
    color: colors.ink900,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  route: {
    gap: 3,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  dotStart: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.ink900,
    backgroundColor: colors.brand600,
  },
  dotEnd: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.ink900,
    backgroundColor: colors.sun400,
  },
  routeText: {
    flex: 1,
    color: colors.ink900,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  fareHint: {
    color: colors.ink700,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  payBlock: {
    gap: space.sm,
  },
  payLabel: {
    color: colors.ink900,
    fontSize: 14,
    fontWeight: "900",
  },
  payRow: {
    flexDirection: "row",
    gap: space.sm,
  },
  payOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: space.md,
  },
  payOptionSelected: {
    borderColor: colors.brand600,
    backgroundColor: colors.brand50,
  },
  payOptionPressed: {
    backgroundColor: colors.sun50,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.ink900,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: colors.brand600,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand600,
  },
  payText: {
    flex: 1,
    gap: 1,
  },
  payTitle: {
    color: colors.ink900,
    fontSize: 14,
    fontWeight: "900",
  },
  payHint: {
    color: colors.ink600,
    fontSize: 11,
    lineHeight: 15,
  },
  payNote: {
    color: colors.ink600,
    fontSize: 12,
    lineHeight: 17,
  },
});
