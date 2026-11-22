import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/lib/theme";

export function BackLink({ fallbackHref = "/profil" }: { fallbackHref?: Href }) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityLabel="Kembali"
      accessibilityRole="button"
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace(fallbackHref);
        }
      }}
      style={styles.back}
    >
      <Text style={styles.backText}>‹ Kembali</Text>
    </Pressable>
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
});
