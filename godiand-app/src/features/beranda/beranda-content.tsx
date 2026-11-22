import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { AppScreen } from "@/components/app-screen";
import { Logo } from "@/components/logo";
import { ServiceGrid } from "@/components/service-grid";
import { Card } from "@/components/ui";
import { explorePlaces, promos } from "@/features/beranda/data";
import { loadFoodMerchants, type FoodMerchant } from "@/lib/merchants";
import { colors, hardShadow, radius, space } from "@/lib/theme";

const NEW_CARD_KEY = "godiand:beranda:new-card-dismissed";

const dayNames = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function todayLabel(): string {
  const now = new Date();

  return `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]}`.toUpperCase();
}

function greetingFor(hour: number): string {
  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export function BerandaContent({ displayName }: { displayName: string }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [promoIndex, setPromoIndex] = useState(0);
  const [foods, setFoods] = useState<FoodMerchant[] | null>(null);
  const [foodsError, setFoodsError] = useState("");
  const [newCardVisible, setNewCardVisible] = useState(false);

  const contentWidth = Math.min(width, 560) - 32;
  const promoWidth = Math.max(240, contentWidth - 26);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(NEW_CARD_KEY)
      .then((value) => {
        if (active) setNewCardVisible(value !== "1");
      })
      .catch(() => {
        if (active) setNewCardVisible(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    loadFoodMerchants()
      .then((result) => {
        if (active) setFoods(result);
      })
      .catch(() => {
        if (!active) return;
        setFoods([]);
        setFoodsError("Daftar warung belum bisa dimuat.");
      });

    return () => {
      active = false;
    };
  }, []);

  function dismissNewCard() {
    setNewCardVisible(false);
    AsyncStorage.setItem(NEW_CARD_KEY, "1").catch(() => {});
  }

  const greeting = `${greetingFor(new Date().getHours())}, ${displayName}`;

  return (
    <AppScreen active="beranda">
      <View style={styles.header}>
        <Logo size={46} />
        <View style={styles.headerText}>
          <Text style={styles.date}>{todayLabel()}</Text>
          <Text numberOfLines={1} style={styles.greeting}>
            {greeting}
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Buka notifikasi"
          accessibilityRole="button"
          onPress={() => router.replace("/notifikasi")}
          style={({ pressed }) => [styles.bell, pressed && styles.bellPressed]}
        >
          <Ionicons
            color={colors.ink900}
            name="notifications-outline"
            size={22}
          />
        </Pressable>
      </View>

      <Pressable
        accessibilityHint="Membuka halaman pesan GoDiandRide"
        accessibilityLabel="Mau ke mana hari ini?"
        accessibilityRole="button"
        onPress={() => router.push("/ride")}
        style={({ pressed }) => [
          styles.search,
          pressed && styles.searchPressed,
        ]}
      >
        <Ionicons color={colors.ink600} name="search" size={20} />
        <Text numberOfLines={1} style={styles.searchText}>
          Mau ke mana hari ini?
        </Text>
        <View style={styles.locationChip}>
          <Ionicons color={colors.ink900} name="location" size={12} />
          <Text style={styles.locationText}>Banda Aceh</Text>
        </View>
      </Pressable>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Layanan</Text>
          <Text style={styles.sectionMeta}>6 layanan</Text>
        </View>
        <ServiceGrid />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Promo hari ini</Text>
          <Text style={styles.sectionMeta}>Geser</Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.promoRow}
          decelerationRate="fast"
          horizontal
          onMomentumScrollEnd={(event) => {
            const next = Math.round(
              event.nativeEvent.contentOffset.x / (promoWidth + 10),
            );
            setPromoIndex(Math.min(promos.length - 1, Math.max(0, next)));
          }}
          showsHorizontalScrollIndicator={false}
          snapToInterval={promoWidth + 10}
        >
          {promos.map((promo) => (
            <View
              key={promo.key}
              style={[
                styles.promo,
                { backgroundColor: promo.background, width: promoWidth },
              ]}
            >
              <View pointerEvents="none" style={styles.promoCircle}>
                <Ionicons
                  color={promo.ink}
                  name={promo.icon}
                  size={64}
                  style={styles.promoIcon}
                />
              </View>
              <View
                style={[
                  styles.promoTag,
                  {
                    borderColor: promo.ink,
                    backgroundColor:
                      promo.ink === "#FFFFFF"
                        ? "rgba(255,255,255,0.16)"
                        : "rgba(255,255,255,0.7)",
                  },
                ]}
              >
                <Text style={[styles.promoTagText, { color: promo.ink }]}>
                  {promo.tag}
                </Text>
              </View>
              <Text style={[styles.promoTitle, { color: promo.ink }]}>
                {promo.title}
              </Text>
              <Text style={[styles.promoBody, { color: promo.ink }]}>
                {promo.body}
              </Text>
              <Pressable
                accessibilityLabel={`Pesan promo ${promo.title}`}
                accessibilityRole="button"
                onPress={() => router.push("/ride")}
                style={({ pressed }) => [
                  styles.promoButton,
                  pressed && styles.promoButtonPressed,
                ]}
              >
                <Text style={styles.promoButtonText}>Pesan</Text>
                <Ionicons
                  color={colors.ink900}
                  name="arrow-forward"
                  size={14}
                />
              </Pressable>
            </View>
          ))}
        </ScrollView>
        <View style={styles.dots}>
          {promos.map((promo, index) => (
            <View
              key={promo.key}
              style={[styles.dot, index === promoIndex && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Jelajahi Banda Aceh</Text>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push("/ride")}
          >
            <Text style={styles.sectionLink}>Semua tujuan</Text>
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={styles.placeRow}
          decelerationRate="fast"
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={244}
        >
          {explorePlaces.map((place) => (
            <View key={place.key} style={styles.placeCard}>
              <View
                style={[
                  styles.placeImage,
                  { backgroundColor: place.tint },
                ]}
              >
                <View
                  pointerEvents="none"
                  style={[styles.placeBlob, { borderColor: colors.white }]}
                />
                <Ionicons
                  color={colors.ink900}
                  name={place.icon}
                  size={32}
                />
                <View style={styles.placeholderPill}>
                  <Text style={styles.placeholderText}>Foto placeholder</Text>
                </View>
              </View>
              <Text numberOfLines={2} style={styles.placeName}>
                {place.name}
              </Text>
              <Text style={styles.placeArea}>{place.area.toUpperCase()}</Text>
              <Text numberOfLines={2} style={styles.placeDesc}>
                {place.description}
              </Text>
              <Pressable
                accessibilityLabel={`Pesan GoDiandRide ke ${place.name}`}
                accessibilityRole="button"
                onPress={() => router.push("/ride")}
                style={({ pressed }) => [
                  styles.placeButton,
                  pressed && styles.placeButtonPressed,
                ]}
              >
                <Text style={styles.placeButtonText}>Pesan GoDiandRide</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Kuliner di Sekitarmu</Text>
          <Pressable
            accessibilityRole="link"
            onPress={() =>
              Alert.alert(
                "Daftar warung",
                "Halaman semua warung segera hadir di aplikasi ya.",
              )
            }
          >
            <Text style={styles.sectionLink}>Semua warung</Text>
          </Pressable>
        </View>

        {foods === null ? (
          <View style={styles.foodLoading}>
            <ActivityIndicator color={colors.brand600} />
            <Text style={styles.foodLoadingText}>
              Mencari warung di sekitarmu...
            </Text>
          </View>
        ) : null}

        {foods !== null && foods.length === 0 ? (
          <Card style={styles.foodEmpty}>
            <View style={styles.foodIcon}>
              <Ionicons
                color={colors.ink900}
                name="restaurant-outline"
                size={26}
              />
            </View>
            <View style={styles.foodEmptyText}>
              <Text style={styles.foodTitle}>Belum ada warung buka</Text>
              <Text style={styles.foodBody}>
                {foodsError || "Warung partner GoDiand akan muncul di sini."}
              </Text>
            </View>
          </Card>
        ) : null}

        {foods !== null && foods.length > 0
          ? foods.map((food) => (
              <View key={food.id} style={styles.foodRow}>
                <View style={styles.foodIcon}>
                  <Ionicons
                    color={colors.ink900}
                    name="restaurant-outline"
                    size={22}
                  />
                </View>
                <View style={styles.foodInfo}>
                  <Text numberOfLines={1} style={styles.foodTitle}>
                    {food.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.foodBody}>
                    {food.address ?? "Banda Aceh"}
                  </Text>
                </View>
                <View style={styles.openBadge}>
                  <Text style={styles.openBadgeText}>Buka</Text>
                </View>
              </View>
            ))
          : null}
      </View>

      {newCardVisible ? (
        <View style={styles.newCard}>
          <Pressable
            accessibilityLabel="Tutup panduan pengguna baru"
            accessibilityRole="button"
            hitSlop={8}
            onPress={dismissNewCard}
            style={styles.newCardClose}
          >
            <Ionicons color={colors.ink600} name="close" size={18} />
          </Pressable>
          <Text style={styles.newCardTitle}>Baru di GoDiand?</Text>
          <Text style={styles.newCardSub}>
            Tiga langkah, langsung jalan.
          </Text>

          {[
            { number: "1", label: "Pilih layanan" },
            { number: "2", label: "Isi detailnya" },
            { number: "3", label: "Driver datang" },
          ].map((step) => (
            <View key={step.number} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.number}</Text>
              </View>
              <Text style={styles.stepLabel}>{step.label}</Text>
            </View>
          ))}

          <Pressable
            accessibilityRole="link"
            onPress={() => router.push("/ride")}
            style={({ pressed }) => pressed && styles.newCardLinkPressed}
          >
            <Text style={styles.newCardLink}>Coba pesan ojek →</Text>
          </Pressable>
        </View>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  headerText: {
    flex: 1,
    gap: 1,
  },
  date: {
    color: colors.ink500,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  greeting: {
    color: colors.ink900,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  bell: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: 22,
    backgroundColor: colors.white,
    ...hardShadow,
  },
  bellPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    elevation: 2,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    minHeight: 54,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    paddingHorizontal: space.md,
    ...hardShadow,
  },
  searchPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    elevation: 2,
  },
  searchText: {
    flex: 1,
    color: colors.ink600,
    fontSize: 14,
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.pill,
    backgroundColor: colors.sun400,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  locationText: {
    color: colors.ink900,
    fontSize: 10,
    fontWeight: "900",
  },
  section: {
    gap: space.md,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.md,
  },
  sectionTitle: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  sectionMeta: {
    color: colors.ink500,
    fontSize: 12,
    fontWeight: "700",
  },
  sectionLink: {
    color: colors.brand700,
    fontSize: 12,
    fontWeight: "900",
  },
  promoRow: {
    gap: 10,
    paddingRight: space.xs,
  },
  promo: {
    minHeight: 176,
    justifyContent: "flex-end",
    gap: 6,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: 18,
    padding: space.lg,
    overflow: "hidden",
    ...hardShadow,
  },
  promoCircle: {
    position: "absolute",
    top: -22,
    right: -14,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  promoIcon: {
    position: "absolute",
    top: 30,
    right: 22,
    opacity: 0.5,
  },
  promoTag: {
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  promoTagText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  promoTitle: {
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  promoBody: {
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.9,
  },
  promoButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    marginTop: 4,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.pill,
    backgroundColor: colors.sun400,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  promoButtonPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  promoButtonText: {
    color: colors.ink900,
    fontSize: 12,
    fontWeight: "900",
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.brand200,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.ink900,
  },
  placeRow: {
    gap: 12,
    paddingRight: space.xs,
  },
  placeCard: {
    width: 232,
    gap: 4,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 10,
    ...hardShadow,
  },
  placeImage: {
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 4,
  },
  placeBlob: {
    position: "absolute",
    top: -26,
    right: -20,
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 10,
    opacity: 0.5,
  },
  placeholderPill: {
    position: "absolute",
    left: 6,
    bottom: 6,
    borderWidth: 1.5,
    borderColor: colors.ink900,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  placeholderText: {
    color: colors.ink600,
    fontSize: 8,
    fontWeight: "800",
  },
  placeName: {
    minHeight: 36,
    color: colors.ink900,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 18,
    paddingHorizontal: 2,
  },
  placeArea: {
    color: colors.ink500,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
    paddingHorizontal: 2,
  },
  placeDesc: {
    minHeight: 34,
    color: colors.ink600,
    fontSize: 11.5,
    lineHeight: 17,
    paddingHorizontal: 2,
    marginTop: 2,
  },
  placeButton: {
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: 12,
    backgroundColor: colors.brand600,
  },
  placeButtonPressed: {
    opacity: 0.85,
  },
  placeButtonText: {
    color: colors.white,
    fontSize: 11.5,
    fontWeight: "900",
  },
  foodLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingVertical: space.md,
  },
  foodLoadingText: {
    color: colors.ink600,
    fontSize: 13,
  },
  foodEmpty: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    padding: space.lg,
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: space.md,
    ...hardShadow,
  },
  foodIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.sm,
    backgroundColor: colors.sun400,
  },
  foodEmptyText: {
    flex: 1,
    gap: 2,
  },
  foodInfo: {
    flex: 1,
    gap: 1,
  },
  foodTitle: {
    color: colors.ink900,
    fontSize: 14,
    fontWeight: "900",
  },
  foodBody: {
    color: colors.ink600,
    fontSize: 12,
    lineHeight: 18,
  },
  openBadge: {
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.pill,
    backgroundColor: colors.mint50,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  openBadgeText: {
    color: colors.mint700,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  newCard: {
    gap: space.sm,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: space.lg,
    ...hardShadow,
  },
  newCardClose: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  newCardTitle: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
    paddingRight: 32,
  },
  newCardSub: {
    color: colors.ink600,
    fontSize: 12,
    lineHeight: 18,
    marginTop: -4,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: 12,
    backgroundColor: colors.sun400,
  },
  stepNumberText: {
    color: colors.ink900,
    fontSize: 12,
    fontWeight: "900",
  },
  stepLabel: {
    color: colors.ink900,
    fontSize: 13,
    fontWeight: "800",
  },
  newCardLink: {
    color: colors.brand700,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
  },
  newCardLinkPressed: {
    opacity: 0.6,
  },
});
