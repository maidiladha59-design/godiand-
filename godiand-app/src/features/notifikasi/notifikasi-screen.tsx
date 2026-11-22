import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/app-screen";
import { Card } from "@/components/ui";
import { colors, radius, space } from "@/lib/theme";

export function NotifikasiScreen() {
  return (
    <AppScreen active="notifikasi">
      <Text style={styles.title}>Notifikasi</Text>

      <Card style={styles.emptyCard}>
        <View style={styles.iconBox}>
          <Ionicons
            color={colors.ink900}
            name="notifications-outline"
            size={30}
          />
        </View>
        <Text style={styles.emptyTitle}>Belum ada notifikasi</Text>
        <Text style={styles.emptyBody}>
          Kabar pesanan dan info layanan akan muncul di sini.
        </Text>
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.ink900,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: space.xxl,
  },
  iconBox: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.md,
    backgroundColor: colors.sun400,
  },
  emptyTitle: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyBody: {
    color: colors.ink600,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
});
