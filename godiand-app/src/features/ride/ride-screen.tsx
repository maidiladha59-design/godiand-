import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { OsmMap } from "@/components/osm-map";
import { PlacePicker } from "@/components/place-picker";
import { RideFareCard } from "@/features/ride/fare-card";
import { Card, InfoNote, Screen } from "@/components/ui";
import {
  cityCenter,
  loadPlaces,
  popularPlaces,
  type PickedPlace,
  type Place,
} from "@/lib/places";
import { useCurrentLocation } from "@/lib/use-current-location";
import { colors, radius, space } from "@/lib/theme";

function pointFromPlace(place: Place): PickedPlace {
  return {
    name: place.name,
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

export function RideScreen() {
  const router = useRouter();
  const location = useCurrentLocation();
  const [pickup, setPickup] = useState<PickedPlace | null>(null);
  const [destination, setDestination] = useState<PickedPlace | null>(null);
  const [places, setPlaces] = useState<Place[]>(popularPlaces);
  const [placesError, setPlacesError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    loadPlaces()
      .then((result) => {
        if (!active) return;
        setPlaces(result.places);
        setPlacesError(result.error);
      })
      .catch(() => {
        if (active) {
          setPlacesError(
            "Daftar tempat belum bisa dimuat. Tujuan populer tetap bisa dipilih.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (location.status !== "granted" || !location.point) return;
    const point = location.point;
    setPickup((current) =>
      current ?? {
        name: "Lokasi saat ini",
        address: point.address,
        latitude: point.latitude,
        longitude: point.longitude,
      },
    );
  }, [location.status, location.point]);

  async function useCurrentPickup() {
    const point = await location.request();
    if (!point) return;
    setPickup({
      name: "Lokasi saat ini",
      address: point.address,
      latitude: point.latitude,
      longitude: point.longitude,
    });
  }

  const center = pickup ?? location.point ?? cityCenter;

  const mapLabel =
    location.status === "locating"
      ? "Mencari lokasi kamu..."
      : pickup
        ? `Titik jemput: ${pickup.name}`
        : location.status === "denied"
          ? "Lokasi belum aktif. Pilih titik jemput dari daftar."
          : "Peta Banda Aceh";

  return (
    <Screen>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kembali"
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/");
          }
        }}
        style={styles.back}
      >
        <Text style={styles.backText}>‹ Kembali</Text>
      </Pressable>

      <View style={styles.head}>
        <View style={styles.headText}>
          <Text style={styles.eyebrow}>GoDiandRide</Text>
          <Text style={styles.title}>Mau ke mana?</Text>
          <Text style={styles.subtitle}>
            Pilih titik jemput dan tujuan. Tarif muncul sebelum pesan.
          </Text>
        </View>
        <View style={styles.modeBadge}>
          <Text style={styles.modeBadgeText}>Ojek</Text>
        </View>
      </View>

      <Card style={styles.mapCard}>
        <OsmMap latitude={center.latitude} longitude={center.longitude} />
        <View style={styles.mapFoot}>
          <View style={styles.mapStatusRow}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    location.status === "granted"
                      ? colors.mint700
                      : colors.sun400,
                },
              ]}
            />
            <Text style={styles.mapLabel}>{mapLabel}</Text>
          </View>

          {location.status === "idle" ? (
            <View style={styles.helpBox}>
              <Text style={styles.helpText}>
                Biar titik jemput otomatis, GoDiand perlu izin lokasi. Lokasi
                cuma dipakai saat kamu pesan.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={useCurrentPickup}
                style={({ pressed }) => [
                  styles.smallButton,
                  pressed && styles.smallButtonPressed,
                ]}
              >
                <Text style={styles.smallButtonText}>Izinkan lokasi</Text>
              </Pressable>
            </View>
          ) : null}

          {location.status === "denied" ? (
            <View style={styles.helpBox}>
              <Text style={styles.helpText}>
                Izin lokasi belum aktif. Kamu bisa pilih titik jemput dari
                daftar, atau buka pengaturan untuk mengizinkan.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  Linking.openSettings().catch(() => {});
                }}
                style={({ pressed }) => [
                  styles.smallButton,
                  pressed && styles.smallButtonPressed,
                ]}
              >
                <Text style={styles.smallButtonText}>Buka pengaturan</Text>
              </Pressable>
            </View>
          ) : null}

          {location.status === "error" ? (
            <View style={styles.helpBox}>
              <Text style={styles.helpText}>
                Lokasi belum ketemu. Coba lagi atau pilih titik jemput dari
                daftar.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void location.refresh();
                }}
                style={({ pressed }) => [
                  styles.smallButton,
                  pressed && styles.smallButtonPressed,
                ]}
              >
                <Text style={styles.smallButtonText}>Coba lagi</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Rute kamu</Text>

        <PlacePicker
          action={{
            label: "Pakai lokasi saat ini",
            busyLabel: "Mencari lokasi...",
            busy: location.busy,
            onPress: () => {
              void useCurrentPickup();
            },
          }}
          hint="Ketik nama tempat, lalu pilih dari daftar."
          label="Titik jemput"
          onChange={setPickup}
          placeholder="Lokasi saat ini"
          places={places}
          value={pickup}
        />

        <PlacePicker
          hint="Pilih dari daftar biar jarak dan tarif bisa dihitung."
          label="Tujuan"
          onChange={setDestination}
          placeholder="Mau ke mana?"
          places={places}
          value={destination}
        />

        {placesError ? <InfoNote message={placesError} /> : null}

        <View style={styles.popularHead}>
          <Text style={styles.popularTitle}>Tujuan populer</Text>
          <Text style={styles.popularMeta}>Sekali ketuk</Text>
        </View>

        <View style={styles.popularGrid}>
          {popularPlaces.map((place) => {
            const active =
              destination?.name === place.name &&
              destination.latitude === place.latitude;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={place.slug}
                onPress={() => setDestination(pointFromPlace(place))}
                style={({ pressed }) => [
                  styles.popularCard,
                  active && styles.popularCardActive,
                  pressed && styles.popularCardPressed,
                ]}
              >
                <View
                  style={[styles.popularDot, active && styles.popularDotActive]}
                />
                <Text style={styles.popularName} numberOfLines={2}>
                  {place.name}
                </Text>
                <Text style={styles.popularAddress} numberOfLines={2}>
                  {place.address}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {pickup && destination ? (
        <RideFareCard
          destination={destination}
          onOrdered={(orderId) => {
            router.push({ pathname: "/ride/mencari", params: { id: orderId } });
          }}
          pickup={pickup}
        />
      ) : (
        <Card>
          <Text style={styles.cardTitle}>Estimasi tarif</Text>
          <Text style={styles.fareEmpty}>
            Pilih titik jemput dan tujuan dulu. Estimasi tarif muncul di sini
            sebelum kamu pesan.
          </Text>
        </Card>
      )}

      <InfoNote message="Jarak dan tarif masih estimasi, minimal Rp9.000. Bayar tunai atau QRIS langsung ke driver." />
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: "flex-start",
    minHeight: 40,
    justifyContent: "center",
  },
  backText: {
    color: colors.brand700,
    fontSize: 15,
    fontWeight: "800",
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.md,
  },
  headText: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: colors.brand700,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  title: {
    color: colors.ink900,
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  subtitle: {
    color: colors.ink600,
    fontSize: 14,
    lineHeight: 20,
  },
  modeBadge: {
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.pill,
    backgroundColor: colors.sun400,
    paddingHorizontal: space.md,
    paddingVertical: 6,
    marginTop: 2,
  },
  modeBadgeText: {
    color: colors.ink900,
    fontSize: 12,
    fontWeight: "900",
  },
  mapCard: {
    padding: 0,
    gap: 0,
    overflow: "hidden",
  },
  mapFoot: {
    padding: space.md,
    gap: space.sm,
  },
  mapStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.ink900,
  },
  mapLabel: {
    flex: 1,
    color: colors.ink700,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  helpBox: {
    gap: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.brand100,
    paddingTop: space.sm,
  },
  helpText: {
    color: colors.ink600,
    fontSize: 12,
    lineHeight: 18,
  },
  smallButton: {
    alignSelf: "flex-start",
    minHeight: 38,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.pill,
    backgroundColor: colors.brand600,
    paddingHorizontal: space.md,
  },
  smallButtonPressed: {
    opacity: 0.8,
  },
  smallButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900",
  },
  cardTitle: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
  },
  fareEmpty: {
    color: colors.ink600,
    fontSize: 13,
    lineHeight: 19,
  },
  popularHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.brand100,
    paddingTop: space.md,
  },
  popularTitle: {
    color: colors.ink900,
    fontSize: 14,
    fontWeight: "900",
  },
  popularMeta: {
    color: colors.ink500,
    fontSize: 11,
    fontWeight: "700",
  },
  popularGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
  },
  popularCard: {
    flexBasis: "47%",
    flexGrow: 1,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: space.md,
    gap: 3,
  },
  popularCardActive: {
    borderColor: colors.brand600,
    backgroundColor: colors.brand50,
  },
  popularCardPressed: {
    backgroundColor: colors.sun50,
  },
  popularDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.ink900,
    backgroundColor: colors.white,
    marginBottom: 2,
  },
  popularDotActive: {
    backgroundColor: colors.brand600,
  },
  popularName: {
    color: colors.ink900,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
  },
  popularAddress: {
    color: colors.ink600,
    fontSize: 11,
    lineHeight: 15,
  },
});
