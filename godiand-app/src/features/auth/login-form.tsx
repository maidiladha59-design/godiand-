import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
  type RefObject,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConfigNotice } from "@/components/config-notice";
import { Loading } from "@/components/ui";
import { sendEmailOtp, verifyEmailOtp } from "@/lib/auth/otp";
import { isValidEmail, normalizeEmail } from "@/lib/auth/validation";
import { legalLinks } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase";

type Step = "email" | "code" | "done";

type Measurable = {
  measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void,
  ) => void;
};

function useFocusedInputScroll() {
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const offsetRef = useRef(0);

  const ensureVisible = useCallback((node: Measurable | null) => {
    if (!node) return;
    setTimeout(() => {
      const scrollView = scrollRef.current;
      if (!scrollView) return;
      node.measureInWindow((_x, y, _width, height) => {
        scrollView.measureInWindow((_sx, sy, _sw, sh) => {
          const margin = 24;
          const overflow = y + height - (sy + sh - margin);
          if (overflow > 0) {
            scrollView.scrollTo({
              y: Math.max(0, offsetRef.current + overflow + 12),
              animated: true,
            });
          }
        });
      });
    }, 300);
  }, []);

  return { scrollRef, offsetRef, ensureVisible };
}

const authColors = {
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
  infoBackground: "#FFF8E1",
} as const;

const fonts = {
  regular: "PlusJakartaSans_400Regular",
  semibold: "PlusJakartaSans_600SemiBold",
  extrabold: "PlusJakartaSans_800ExtraBold",
} as const;

function openLegal(url: string) {
  Linking.openURL(url).catch(() => {
    Alert.alert(
      "Tautan belum bisa dibuka",
      "Coba buka Syarat Layanan atau Kebijakan Privasi lewat browser ya.",
    );
  });
}

function AuthLayout({
  children,
  scrollRef,
  onScrollOffset,
}: {
  children: ReactNode;
  scrollRef?: RefObject<ComponentRef<typeof ScrollView> | null>;
  onScrollOffset?: (offset: number) => void;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          onScroll={(event) =>
            onScrollOffset?.(event.nativeEvent.contentOffset.y)
          }
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.page}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AuthHeader() {
  return (
    <View style={styles.header}>
      <Image
        accessibilityLabel="Logo GoDiand"
        source={require("../../../assets/logo.png")}
        style={styles.logo}
      />
      <Text style={styles.brandName}>GoDiand</Text>
      <Text style={styles.tagline}>
        Ojek, antar, makan. Sat-set di Banda Aceh.
      </Text>
    </View>
  );
}

function AuthCard({ children }: { children: ReactNode }) {
  return (
    <View style={styles.cardWrap}>
      <View pointerEvents="none" style={styles.cardShadow} />
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  hint,
  inputRef,
  onFocus,
  ...inputProps
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  hint?: string;
  inputRef?: RefObject<ComponentRef<typeof TextInput> | null>;
  onFocus?: () => void;
} & Pick<
  TextInputProps,
  | "keyboardType"
  | "autoCapitalize"
  | "autoComplete"
  | "maxLength"
  | "textContentType"
  | "inputMode"
  | "autoFocus"
>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={inputRef}
        accessibilityLabel={label}
        autoCorrect={false}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholder={placeholder}
        placeholderTextColor={authColors.placeholder}
        style={styles.input}
        value={value}
        {...inputProps}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

function AuthButton({
  label,
  onPress,
  disabled = false,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const inactive = disabled || loading;

  return (
    <View style={styles.buttonWrap}>
      <View pointerEvents="none" style={styles.buttonShadow} />
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: loading, disabled: inactive }}
        disabled={inactive}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          disabled && styles.buttonDisabled,
          pressed && !inactive && styles.buttonPressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={authColors.white} />
        ) : (
          <Text
            style={[
              styles.buttonLabel,
              disabled && styles.buttonLabelDisabled,
            ]}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

function Note({
  message,
  tone,
}: {
  message: string;
  tone: "error" | "info";
}) {
  const isError = tone === "error";

  return (
    <View
      accessibilityRole={isError ? "alert" : undefined}
      style={[styles.note, isError ? styles.noteError : styles.noteInfo]}
    >
      <Text
        style={[
          styles.noteText,
          isError ? styles.noteTextError : styles.noteTextInfo,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

function CodeBoxes({
  value,
  onChangeText,
  onRowFocus,
}: {
  value: string;
  onChangeText: (value: string) => void;
  onRowFocus?: (node: Measurable | null) => void;
}) {
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const rowRef = useRef<ComponentRef<typeof View>>(null);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");
  const activeIndex = Math.min(value.length, 5);

  return (
    <View ref={rowRef}>
      <Pressable
        accessibilityRole="none"
        onPress={() => inputRef.current?.focus()}
        style={styles.codeRow}
      >
        {digits.map((digit, index) => (
          <View
            key={index}
            style={[
              styles.codeBox,
              index === activeIndex && styles.codeBoxActive,
            ]}
          >
            <Text style={styles.codeDigit}>{digit}</Text>
          </View>
        ))}
        <TextInput
          ref={inputRef}
          accessibilityLabel="Kode 6 angka"
          autoComplete="one-time-code"
          autoFocus
          caretHidden
          keyboardType="number-pad"
          maxLength={6}
          onChangeText={(text) =>
            onChangeText(text.replace(/\D/g, "").slice(0, 6))
          }
          onFocus={() => onRowFocus?.(rowRef.current)}
          style={styles.codeInput}
          textContentType="oneTimeCode"
          value={value}
        />
      </Pressable>
    </View>
  );
}

export function LoginForm() {
  if (!isSupabaseConfigured) {
    return (
      <AuthLayout>
        <ConfigNotice />
      </AuthLayout>
    );
  }

  return <LoginFormContent />;
}

function LoginFormContent() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const { scrollRef, offsetRef, ensureVisible } = useFocusedInputScroll();
  const emailRef = useRef<ComponentRef<typeof TextInput>>(null);
  const phoneRef = useRef<ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const phoneLocal = phone.startsWith("+62") ? phone.slice(3) : phone;
  const emailReady = isValidEmail(normalizeEmail(email));

  function updatePhone(value: string) {
    const digits = value
      .replace(/\D/g, "")
      .replace(/^62/, "")
      .replace(/^0+/, "")
      .slice(0, 11);
    setPhone(digits ? `+62${digits}` : "");
    setError("");
  }

  function resetToEmailStep() {
    setStep("email");
    setToken("");
    setNotice("");
    setError("");
    setCooldown(0);
  }

  async function handleSend() {
    if (busy || !emailReady) return;
    setBusy(true);
    setError("");
    setNotice("");

    const result = await sendEmailOtp(email, {
      phone: phone || undefined,
    });

    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setStep("code");
    setToken("");
    setCooldown(60);
    setNotice(`Kode 6 angka sudah dikirim ke ${normalizeEmail(email)}.`);
  }

  async function handleResend() {
    if (busy || resending || cooldown > 0) return;
    setResending(true);
    setError("");
    setNotice("");

    const result = await sendEmailOtp(email, {
      phone: phone || undefined,
    });

    setResending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setCooldown(60);
    setNotice("Kode baru sudah dikirim. Cek inbox atau spam.");
  }

  async function handleVerify() {
    if (busy) return;
    setBusy(true);
    setError("");

    const result = await verifyEmailOtp(email, token);

    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setStep("done");
  }

  if (step === "done") {
    return <Loading label="Kamu sudah masuk. Sebentar ya..." />;
  }

  if (step === "code") {
    return (
      <AuthLayout
        onScrollOffset={(offset) => {
          offsetRef.current = offset;
        }}
        scrollRef={scrollRef}
      >
        <AuthHeader />
        <AuthCard>
          <View style={styles.heading}>
            <Text style={styles.title}>Masukkan kode</Text>
            <Text style={styles.subtitle}>
              Kode 6 angka untuk {normalizeEmail(email)}. Cek inbox atau spam.
            </Text>
          </View>

          <CodeBoxes
            onChangeText={(value) => {
              setToken(value);
              setError("");
            }}
            onRowFocus={ensureVisible}
            value={token}
          />

          {notice ? <Note message={notice} tone="info" /> : null}
          {error ? <Note message={error} tone="error" /> : null}

          <AuthButton
            disabled={token.length !== 6}
            label="Masuk"
            loading={busy}
            onPress={handleVerify}
          />

          <View style={styles.linkGroup}>
            <Text
              accessibilityRole="button"
              onPress={handleResend}
              style={[
                styles.link,
                cooldown > 0 || busy || resending
                  ? styles.linkMuted
                  : undefined,
              ]}
            >
              {resending
                ? "Mengirim..."
                : cooldown > 0
                  ? `Kirim ulang kode (${cooldown}s)`
                  : "Kirim ulang kode"}
            </Text>
            <Text
              accessibilityRole="button"
              onPress={resetToEmailStep}
              style={styles.link}
            >
              Ubah email
            </Text>
          </View>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      onScrollOffset={(offset) => {
        offsetRef.current = offset;
      }}
      scrollRef={scrollRef}
    >
      <AuthHeader />
      <AuthCard>
        <View style={styles.heading}>
          <Text style={styles.title}>Masuk ke GoDiand</Text>
          <Text style={styles.subtitle}>
            Kami kirim kode 6 angka ke emailmu. Tanpa password.
          </Text>
        </View>

        <InputField
          autoCapitalize="none"
          autoComplete="email"
          inputMode="email"
          inputRef={emailRef}
          keyboardType="email-address"
          label="Email"
          onChangeText={(value) => {
            setEmail(value);
            setError("");
          }}
          onFocus={() => ensureVisible(emailRef.current)}
          placeholder="nama@email.com"
          textContentType="emailAddress"
          value={email}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Nomor HP (opsional)</Text>
          <View style={styles.phoneRow}>
            <Text style={styles.phonePrefix}>+62</Text>
            <TextInput
              ref={phoneRef}
              accessibilityLabel="Nomor HP"
              autoComplete="tel"
              inputMode="tel"
              keyboardType="phone-pad"
              maxLength={11}
              onChangeText={updatePhone}
              onFocus={() => ensureVisible(phoneRef.current)}
              placeholder="8xx xxxx xxxx"
              placeholderTextColor={authColors.placeholder}
              style={styles.phoneInput}
              textContentType="telephoneNumber"
              value={phoneLocal}
            />
          </View>
          <Text style={styles.hint}>
            Cuma kontak untuk driver, tidak diverifikasi.
          </Text>
        </View>

        {error ? <Note message={error} tone="error" /> : null}

        <AuthButton
          disabled={!emailReady}
          label="Kirim kode"
          loading={busy}
          onPress={handleSend}
        />

        <Text style={styles.legal}>
          Dengan masuk, kamu menyetujui{" "}
          <Text
            accessibilityRole="link"
            onPress={() => openLegal(legalLinks.terms)}
            style={styles.legalLink}
          >
            Syarat Layanan
          </Text>{" "}
          dan{" "}
          <Text
            accessibilityRole="link"
            onPress={() => openLegal(legalLinks.privacy)}
            style={styles.legalLink}
          >
            Kebijakan Privasi
          </Text>
          .
        </Text>
      </AuthCard>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: authColors.background,
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
  logo: {
    width: 96,
    height: 96,
  },
  brandName: {
    color: authColors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 32,
    letterSpacing: -0.8,
    marginTop: 2,
  },
  tagline: {
    color: authColors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
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
    backgroundColor: authColors.ink,
  },
  card: {
    borderWidth: 2,
    borderColor: authColors.ink,
    borderRadius: 24,
    backgroundColor: authColors.white,
    padding: 20,
    gap: 16,
  },
  heading: {
    alignItems: "center",
    gap: 4,
  },
  title: {
    color: authColors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 24,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  subtitle: {
    color: authColors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  field: {
    gap: 6,
  },
  label: {
    color: authColors.ink,
    fontFamily: fonts.semibold,
    fontSize: 13,
    letterSpacing: 0.1,
    textAlign: "center",
  },
  input: {
    height: 56,
    borderWidth: 2,
    borderColor: authColors.ink,
    borderRadius: 16,
    backgroundColor: authColors.white,
    paddingHorizontal: 16,
    color: authColors.ink,
    fontFamily: fonts.regular,
    fontSize: 16,
    textAlignVertical: "center",
  },
  phoneRow: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: authColors.ink,
    borderRadius: 16,
    backgroundColor: authColors.white,
    paddingHorizontal: 16,
    gap: 6,
  },
  phonePrefix: {
    color: authColors.ink,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  phoneInput: {
    flex: 1,
    height: "100%",
    color: authColors.ink,
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingVertical: 0,
    textAlignVertical: "center",
  },
  hint: {
    color: authColors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
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
    backgroundColor: authColors.ink,
  },
  button: {
    height: 56,
    borderWidth: 2,
    borderColor: authColors.ink,
    borderRadius: 16,
    backgroundColor: authColors.brand,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  buttonPressed: {
    transform: [{ translateX: 3 }, { translateY: 3 }],
  },
  buttonDisabled: {
    backgroundColor: authColors.disabledBackground,
  },
  buttonLabel: {
    color: authColors.white,
    fontFamily: fonts.extrabold,
    fontSize: 16,
  },
  buttonLabelDisabled: {
    color: authColors.disabledText,
  },
  note: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noteError: {
    borderColor: "#E4552F",
    backgroundColor: authColors.dangerBackground,
  },
  noteInfo: {
    borderColor: authColors.ink,
    backgroundColor: authColors.infoBackground,
  },
  noteText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  noteTextError: {
    color: authColors.dangerText,
  },
  noteTextInfo: {
    color: authColors.ink,
  },
  legal: {
    color: authColors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  legalLink: {
    color: authColors.brand,
    fontFamily: fonts.semibold,
    textDecorationLine: "underline",
  },
  codeRow: {
    flexDirection: "row",
    gap: 8,
  },
  codeBox: {
    flex: 1,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: authColors.ink,
    borderRadius: 14,
    backgroundColor: authColors.white,
  },
  codeBoxActive: {
    backgroundColor: "#EEF8FF",
  },
  codeDigit: {
    color: authColors.ink,
    fontFamily: fonts.extrabold,
    fontSize: 22,
  },
  codeInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
  linkGroup: {
    alignItems: "center",
    gap: 10,
  },
  link: {
    color: authColors.brand,
    fontFamily: fonts.semibold,
    fontSize: 14,
    textAlign: "center",
  },
  linkMuted: {
    color: authColors.muted,
    fontFamily: fonts.semibold,
    fontSize: 14,
    textAlign: "center",
  },
});
