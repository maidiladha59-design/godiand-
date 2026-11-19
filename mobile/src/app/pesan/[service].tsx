import {
  Redirect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { MenuItemRow } from "@/components/menu-item-row";
import { MerchantPicker } from "@/components/merchant-picker";
import { PageHeader } from "@/components/page-header";
import { PlacePicker } from "@/components/place-picker";
import {
  Card,
  ErrorNote,
  Field,
  InfoNote,
  Loading,
  Screen,
  SecondaryButton,
} from "@/components/ui";
import { BookingSummary } from "@/features/orders/booking-summary";
import { useBooking } from "@/features/orders/use-booking";
import type { ServiceType } from "@/lib/database.types";
import { formatRupiah } from "@/lib/format";
import { getService, type ServiceInfo } from "@/lib/services";
import { useSession } from "@/lib/session";
import { colors, space } from "@/lib/theme";

const noteFields: Record<
  ServiceType,
  { label: string; hint: string; placeholder: string }
> = {
  ride: {
    label: "Catatan untuk driver",
    hint: "Opsional.",
    placeholder: "Contoh: tunggu di gerbang depan.",
  },
  send: {
    label: "Isi paket",
    hint: "Opsional. Sebutkan jenis barang biar driver siap.",
    placeholder: "Contoh: dokumen, jangan dilipat.",
  },
  food: {
    label: "Catatan pesanan",
    hint: "Opsional.",
    placeholder: "Contoh: tanpa sambal.",
  },
  laundry: {
    label: "Catatan laundry",
    hint: "Opsional.",
    placeholder: "Contoh: 3 kg, pisahkan pakaian putih.",
  },
  titip: {
    label: "Titip apa?",
    hint: "Wajib diisi supaya driver tahu yang perlu dibeli.",
    placeholder: "Contoh: beli 2 roti dan 1 susu.",
  },
  mart: {
    label: "Catatan belanja",
    hint: "Opsional.",
    placeholder: "Contoh: beli air galon dan sabun.",
  },
};

export default function BookingScreen() {
  const { session, loading } = useSession();
  const params = useLocalSearchParams<{ service?: string }>();
  const service = getService(params.service);

  if (loading) {
    return <Loading label="Menyiapkan layanan..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  if (!service) {
    return <Redirect href="/pesan" />;
  }

  return <BookingContent service={service} userId={session.user.id} />;
}

function BookingContent({
  service,
  userId,
}: {
  service: ServiceInfo;
  userId: string;
}) {
  const router = useRouter();
  const booking = useBooking(service, userId);
  const noteField = noteFields[service.key];

  const showMenuCard =
    service.key !== "laundry" ||
    booking.loadingMenu ||
    booking.menuError !== "" ||
    booking.menuItems.length > 0;

  async function handleSubmit() {
    const orderId = await booking.submit();

    if (orderId) {
      router.replace(`/pesanan/${orderId}`);
    }
  }

  return (
    <Screen>
      <PageHeader title={`Pesan ${service.label}`} subtitle={service.description} />

      {booking.loadingPlaces ? (
        <Loading label="Memuat titik lokasi..." />
      ) : booking.placesError ? (
        <Card>
          <ErrorNote message={booking.placesError} />
          <SecondaryButton
            label="Muat ulang"
            onPress={booking.retryPlaces}
          />
        </Card>
      ) : booking.needsMerchant ? (
        <>
          <Card>
            <Text style={styles.cardTitle}>Toko</Text>

            {booking.loadingMerchants ? (
              <Text style={styles.loadingText}>Memuat daftar toko...</Text>
            ) : booking.merchantsError ? (
              <>
                <ErrorNote message={booking.merchantsError} />
                <SecondaryButton
                  label="Muat ulang toko"
                  onPress={booking.retryMerchants}
                />
              </>
            ) : booking.merchants.length === 0 ? (
              <InfoNote message="Belum ada toko aktif untuk layanan ini. Coba layanan lain dulu ya." />
            ) : (
              <MerchantPicker
                merchants={booking.merchants}
                onChange={booking.selectMerchant}
                value={booking.merchantId}
              />
            )}
          </Card>

          {booking.merchant ? (
            <>
              {showMenuCard ? (
                <Card>
                  <Text style={styles.cardTitle}>Menu toko</Text>

                  {booking.loadingMenu ? (
                    <Text style={styles.loadingText}>Memuat menu...</Text>
                  ) : booking.menuError ? (
                    <>
                      <ErrorNote message={booking.menuError} />
                      <SecondaryButton
                        label="Muat ulang menu"
                        onPress={booking.retryMenu}
                      />
                    </>
                  ) : booking.menuItems.length === 0 ? (
                    <InfoNote message="Toko ini belum punya menu tersedia." />
                  ) : (
                    <View style={styles.menuList}>
                      {booking.menuItems.map((item) => (
                        <MenuItemRow
                          item={item}
                          key={item.id}
                          onChange={(quantity) =>
                            booking.setQuantity(item.id, quantity)
                          }
                          quantity={booking.cart[item.id] ?? 0}
                        />
                      ))}
                    </View>
                  )}

                  {booking.itemsTotal > 0 ? (
                    <View style={styles.subtotalRow}>
                      <Text style={styles.subtotalLabel}>
                        Subtotal menu ({booking.itemCount} item)
                      </Text>
                      <Text style={styles.subtotalValue}>
                        {formatRupiah(booking.itemsTotal)}
                      </Text>
                    </View>
                  ) : null}
                </Card>
              ) : null}

              <Card>
                <Text style={styles.cardTitle}>
                  {service.key === "laundry" ? "Titik jemput" : "Antar ke"}
                </Text>
                <PlacePicker
                  hint="Pilih dari daftar titik Godiand."
                  label={
                    service.key === "laundry" ? "Jemput di" : "Tujuan antar"
                  }
                  onChange={booking.setMerchantPlaceId}
                  places={booking.places}
                  value={booking.merchantPlaceId}
                />
              </Card>
            </>
          ) : null}
        </>
      ) : (
        <Card>
          <Text style={styles.cardTitle}>Titik</Text>
          <PlacePicker
            label="Titik jemput"
            onChange={booking.setPickupId}
            places={booking.places}
            value={booking.pickupId}
          />
          <PlacePicker
            hint="Titik jemput dan tujuan harus berbeda."
            label="Titik tujuan"
            onChange={booking.setDropoffId}
            places={booking.places}
            value={booking.dropoffId}
          />
        </Card>
      )}

      {!booking.loadingPlaces &&
      !booking.placesError &&
      (!booking.needsMerchant || booking.merchant) ? (
        <>
          <Card>
            <Text style={styles.cardTitle}>Catatan</Text>
            <Field
              hint={noteField.hint}
              label={noteField.label}
              maxLength={500}
              multiline
              numberOfLines={4}
              onChangeText={booking.setNotes}
              placeholder={noteField.placeholder}
              value={booking.notes}
            />
          </Card>

          <BookingSummary
            distance={booking.distance}
            fare={booking.fare}
            fareError={booking.fareError}
            fareLoading={booking.fareLoading}
            formError={booking.formError}
            itemCount={booking.itemCount}
            itemsTotal={booking.itemsTotal}
            onSubmit={handleSubmit}
            submitting={booking.submitting}
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    color: colors.ink900,
    fontSize: 16,
    fontWeight: "900",
  },
  loadingText: {
    color: colors.ink600,
    fontSize: 13,
  },
  menuList: {
    gap: space.sm,
  },
  subtotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    borderTopWidth: 2,
    borderTopColor: colors.ink900,
    paddingTop: space.md,
  },
  subtotalLabel: {
    color: colors.ink900,
    fontSize: 13,
    fontWeight: "800",
  },
  subtotalValue: {
    color: colors.brand700,
    fontSize: 15,
    fontWeight: "900",
  },
});
