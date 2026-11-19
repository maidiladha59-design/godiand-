import { Alert, Linking, Pressable, StyleSheet, Text } from "react-native";
import { colors, hardShadow, radius, space } from "@/lib/theme";

function openEmergencyCall() {
  Alert.alert(
    "SOS darurat",
    "Kamu akan diarahkan ke panggilan darurat 112. Lanjutkan?",
    [
      { text: "Batal", style: "cancel" },
      {
        text: "Telepon 112",
        style: "destructive",
        onPress: () => {
          Linking.openURL("tel:112").catch(() => {
            Alert.alert(
              "Tidak bisa membuka panggilan",
              "Coba telepon 112 secara manual ya.",
            );
          });
        },
      },
    ],
  );
}

export function SosButton() {
  return (
    <Pressable
      accessibilityHint="Membuka konfirmasi panggilan darurat 112"
      accessibilityLabel="Tombol SOS darurat"
      accessibilityRole="button"
      onPress={openEmergencyCall}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>SOS</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 64,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.pill,
    backgroundColor: colors.coral600,
    paddingHorizontal: space.md,
    ...hardShadow,
  },
  pressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOpacity: 1,
    elevation: 2,
  },
  label: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
});
