import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "@/components/logo";
import { saveMyName, validateName } from "@/lib/profile";

const palette = {
  background: "#F3F8FC",
  ink: "#0B2536",
  muted: "#4D6672",
  placeholder: "#7D909A",
  brand: "#0A78B5",
  disabledBackground: "#DCE7F0",
  disabledText: "#76858D",
  white: "#FFFFFF",
  dangerBackground: "#FFEFE9",
  dangerText: "#B93F20",
} as const;

const fonts = {
  regular: "PlusJakartaSans_400Regular",
  semibold: "PlusJakartaSans_600SemiBold",
  extrabold: "PlusJakartaSans_800ExtraBold",
} as const;

export function NameScreen({ onSaved }: { onSaved: () => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);

  const problem = validateName(name);
  const valid = problem === null;

  async function handleSave() {
    if (busy || !valid) {
      setTouched(true);
      return;
    }

    setBusy(true);
    setError("");

    const result = await saveMyName(name);

    if (!result.ok) {
      setBusy(false);
      setError(result.message);
      return;
    }

    onSaved();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.page}>
            <View style={styles.header}>
              <Logo size={96} variant="dengan-nama" />
            </View>

            <View style={styles.cardWrap}>
              <View pointerEvents="none" style={styles.cardShadow} />
              <View style={styles.card}>
                <View style={styles.heading}>
                  <Text style={styles.title}>Siapa namamu?</Text>
                  <Text style={styles.subtitle}>
                    Nama ini terlihat oleh driver saat menjemputmu.
                  </Text>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Nama</Text>
                  <TextInput
                    accessibilityLabel="Nama"
                    autoCapitalize="words"
                    autoComplete="name"
                    autoCorrect={false}
                    maxLength={40}
                    onBlur={() => setTouched(true)}
                    onChangeText={(value) => {
                      setName(value);
                      setError("");
                    }}
                    placeholder="Nama panggilanmu"
                    placeholderTextColor={palette.placeholder}
                    style={styles.input}
                    textContentType="name"
                    value={name}
                  />
                  {touched && problem ? (
                    <Text style={styles.hint}>{problem}</Text>
                  ) : (
                    <Text style={styles.hint}>
                      2–40 karakter. Contoh: Razi.
                    </Text>
                  )}
                </View>

                {error ? (
                  <View accessibilityRole="alert" style={styles.note}>
                    <Text style={styles.noteText}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.buttonWrap}>
                  <View pointerEvents="none" style={styles.buttonShadow} />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ busy, disabled: !valid }}
                    disabled={busy || !valid}
                    onPress={handleSave}
                    style={({ pressed }) => [
                      styles.button,
                      !valid && styles.buttonDisabled,
                      pressed && valid && !busy && styles.buttonPressed,
                    ]}
                  >
                    {busy ? (
                      <ActivityIndicator color={palette.white} />
                    ) : (
                      <Text
                        style={[
                          styles.buttonLabel,
                          !valid && styles.buttonLabelDisabled,
                        ]}
                      >
                        Lanjut
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>

            <Text style={styles.footNote}>
              Nama ini juga dipakai untuk menyapa kamu di beranda.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 120,
  },
  page: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    gap: 24,
  },
  header: {
    alignItems: "center",
    gap: 6,
  },
  cardWrap: {
    paddingRight: 4,
    paddingBottom: 4,
  },
  cardShadow: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    backgroundColor: palette.ink,
  },
  card: {
    borderWidth: 2,
    borderColor: palette.ink,
    borderRadius: 24,
    backgroundColor: palette.white,
    padding: 20,
    gap: 16,
  },
  heading: {
    alignItems: "center",
    gap: 4,
  },
  title: {
    color: palette.ink,
    fontFamily: fonts.extrabold,
    fontSize: 24,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  subtitle: {
    color: palette.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  field: {
    gap: 6,
  },
  label: {
    color: palette.ink,
    fontFamily: fonts.semibold,
    fontSize: 13,
    letterSpacing: 0.1,
    textAlign: "center",
  },
  input: {
    height: 56,
    borderWidth: 2,
    borderColor: palette.ink,
    borderRadius: 16,
    backgroundColor: palette.white,
    paddingHorizontal: 16,
    color: palette.ink,
    fontFamily: fonts.regular,
    fontSize: 16,
    textAlignVertical: "center",
  },
  hint: {
    color: palette.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  note: {
    borderWidth: 2,
    borderColor: "#E4552F",
    borderRadius: 12,
    backgroundColor: palette.dangerBackground,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noteText: {
    color: palette.dangerText,
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  buttonWrap: {
    paddingRight: 3,
    paddingBottom: 3,
  },
  buttonShadow: {
    position: "absolute",
    top: 3,
    left: 3,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    backgroundColor: palette.ink,
  },
  button: {
    height: 56,
    borderWidth: 2,
    borderColor: palette.ink,
    borderRadius: 16,
    backgroundColor: palette.brand,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  buttonPressed: {
    transform: [{ translateX: 3 }, { translateY: 3 }],
  },
  buttonDisabled: {
    backgroundColor: palette.disabledBackground,
  },
  buttonLabel: {
    color: palette.white,
    fontFamily: fonts.extrabold,
    fontSize: 16,
  },
  buttonLabelDisabled: {
    color: palette.disabledText,
  },
  footNote: {
    color: palette.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
