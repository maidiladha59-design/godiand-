import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui";
import { colors, radius, space } from "@/lib/theme";

export function ConfigNotice() {
  return (
    <Card>
      <Text style={styles.title}>Supabase belum diatur</Text>
      <Text style={styles.body}>
        Isi dua variabel ini di{" "}
        <Text style={styles.strong}>godiand-app/.env.local</Text>, lalu jalankan
        ulang Expo:
      </Text>
      <View style={styles.codeBox}>
        <Text style={styles.code}>EXPO_PUBLIC_SUPABASE_URL</Text>
        <Text style={styles.code}>EXPO_PUBLIC_SUPABASE_ANON_KEY</Text>
      </View>
      <Text style={styles.body}>
        Nilai anon/publishable aman ada di aplikasi. Jangan pernah memakai
        service_role atau secret key di sini.
      </Text>
    </Card>
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
    lineHeight: 21,
  },
  strong: {
    color: colors.ink900,
    fontWeight: "800",
  },
  codeBox: {
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.sm,
    backgroundColor: colors.mist,
    padding: space.md,
    gap: 6,
  },
  code: {
    color: colors.brand900,
    fontSize: 12,
    fontWeight: "700",
  },
});
