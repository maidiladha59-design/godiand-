import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ConfigNotice } from "@/components/config-notice";
import {
  Card,
  ErrorNote,
  Field,
  InfoNote,
  Loading,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";
import { sendEmailOtp, verifyEmailOtp } from "@/lib/auth/otp";
import type { EmailOtpMode } from "@/lib/auth/otp";
import { normalizeEmail } from "@/lib/auth/validation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { colors, radius, space } from "@/lib/theme";

type Step = "email" | "code" | "done";

const modes: { value: EmailOtpMode; label: string }[] = [
  { value: "login", label: "Masuk" },
  { value: "register", label: "Daftar" },
];

export function LoginForm() {
  if (!isSupabaseConfigured) {
    return <ConfigNotice />;
  }

  return <LoginFormContent />;
}

function LoginFormContent() {
  const [mode, setMode] = useState<EmailOtpMode>("login");
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function switchMode(next: EmailOtpMode) {
    if (next === mode) return;
    setMode(next);
    setStep("email");
    setToken("");
    setError("");
    setNotice("");
    setCooldown(0);
  }

  async function handleSend() {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");

    const result = await sendEmailOtp(
      email,
      mode === "register"
        ? { mode, name, phone: phone || undefined }
        : { mode },
    );

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

    const result = await sendEmailOtp(
      email,
      mode === "register"
        ? { mode, name, phone: phone || undefined }
        : { mode },
    );

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
      <Card>
        <Text style={styles.title}>Masukkan kode</Text>
        <Text style={styles.subtitle}>
          Kode 6 angka untuk {normalizeEmail(email)}. Cek inbox atau spam.
        </Text>

        <Field
          autoComplete="one-time-code"
          center
          keyboardType="number-pad"
          label="Kode dari email"
          maxLength={6}
          onChangeText={(value) => {
            setToken(value.replace(/\D/g, "").slice(0, 6));
            setError("");
          }}
          placeholder="000000"
          textContentType="oneTimeCode"
          value={token}
        />

        {notice ? <InfoNote message={notice} /> : null}
        {error ? <ErrorNote message={error} /> : null}

        <PrimaryButton
          label="Verifikasi"
          loading={busy}
          onPress={handleVerify}
        />

        <SecondaryButton
          disabled={cooldown > 0 || busy || resending}
          label={
            cooldown > 0 ? `Kirim ulang (${cooldown}s)` : "Kirim ulang kode"
          }
          onPress={handleResend}
        />

        <SecondaryButton
          disabled={busy}
          label="Ubah email"
          onPress={() => {
            setStep("email");
            setToken("");
            setNotice("");
            setError("");
            setCooldown(0);
          }}
        />
      </Card>
    );
  }

  return (
    <Card>
      <View accessibilityRole="tablist" style={styles.tabs}>
        {modes.map((item) => {
          const active = item.value === mode;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              key={item.value}
              onPress={() => switchMode(item.value)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.heading}>
        <Text style={styles.title}>
          {mode === "login" ? "Masuk ke Godiand" : "Daftar akun Godiand"}
        </Text>
        <Text style={styles.subtitle}>
          Tanpa password. Kode 6 angka dikirim ke email.
        </Text>
      </View>

      <Field
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        inputMode="email"
        keyboardType="email-address"
        label="Email"
        onChangeText={(value) => {
          setEmail(value);
          setError("");
        }}
        placeholder="nama@email.com"
        textContentType="emailAddress"
        value={email}
      />

      {mode === "register" ? (
        <>
          <Field
            autoCapitalize="words"
            autoComplete="name"
            label="Nama"
            onChangeText={(value) => {
              setName(value);
              setError("");
            }}
            placeholder="Nama kamu"
            textContentType="name"
            value={name}
          />
          <Field
            autoComplete="tel"
            hint="Opsional. Cuma kontak untuk driver, tidak diverifikasi."
            inputMode="tel"
            keyboardType="phone-pad"
            label="Nomor HP"
            onChangeText={(value) => {
              setPhone(value);
              setError("");
            }}
            placeholder="08xx atau +628xx"
            textContentType="telephoneNumber"
            value={phone}
          />
        </>
      ) : null}

      {error ? <ErrorNote message={error} /> : null}

      <PrimaryButton
        label={busy ? "Mengirim..." : "Kirim kode"}
        loading={busy}
        onPress={handleSend}
      />

      <Text style={styles.footnote}>
        {mode === "login"
          ? "Belum punya akun? Pilih Daftar di atas."
          : "Sudah punya akun? Pilih Masuk di atas."}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.pill,
    backgroundColor: colors.mist,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    borderRadius: radius.pill,
    paddingVertical: 9,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: colors.ink900,
  },
  tabLabel: {
    color: colors.ink600,
    fontSize: 14,
    fontWeight: "800",
  },
  tabLabelActive: {
    color: colors.white,
  },
  heading: {
    gap: 4,
  },
  title: {
    color: colors.ink900,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: colors.ink600,
    fontSize: 14,
    lineHeight: 20,
  },
  footnote: {
    color: colors.ink500,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
