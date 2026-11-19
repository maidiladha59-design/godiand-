import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, space } from "@/lib/theme";

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  }

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityLabel="Kembali"
        accessibilityRole="button"
        onPress={handleBack}
        style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
      >
        <Text style={styles.backText}>←</Text>
      </Pressable>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.md,
  },
  back: {
    width: 42,
    height: 42,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  backPressed: {
    backgroundColor: colors.sun50,
  },
  backText: {
    color: colors.ink900,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 26,
  },
  text: {
    flex: 1,
    gap: 2,
    paddingTop: 2,
  },
  title: {
    color: colors.ink900,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  subtitle: {
    color: colors.ink600,
    fontSize: 13,
    lineHeight: 19,
  },
});
