import { Link } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { Card, Screen } from "@/components/ui";
import { colors } from "@/lib/theme";

export default function NotFoundScreen() {
  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Halaman tidak ditemukan</Text>
        <Text style={styles.body}>
          Alamat ini belum ada. Balik ke beranda ya.
        </Text>
        <Link href="/" style={styles.link}>
          Ke beranda
        </Link>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.ink900,
    fontSize: 20,
    fontWeight: "900",
  },
  body: {
    color: colors.ink600,
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    color: colors.brand700,
    fontSize: 15,
    fontWeight: "800",
  },
});
