import { useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { ChoiceTabs, type ChoiceOption } from "@/components/choice-tabs";
import {
  Card,
  ErrorNote,
  Field,
  InfoNote,
  Loading,
  PrimaryButton,
  Screen,
  ScreenTitle,
  SecondaryButton,
} from "@/components/ui";
import { useDriver } from "@/lib/driver";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { colors, space } from "@/lib/theme";

const vehicles: ChoiceOption<"motor" | "mobil">[] = [
  { value: "motor", label: "Motor" },
  { value: "mobil", label: "Mobil" },
];

export default function RegisterDriverScreen() {
  const { session, loading: sessionLoading } = useSession();
  const { driver, loading: driverLoading, createProfile } = useDriver();

  if (sessionLoading || driverLoading) {
    return <Loading label="Menyiapkan pendaftaran..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  if (driver) {
    return <Redirect href="/" />;
  }

  return (
    <RegisterDriverContent
      email={session.user.email ?? ""}
      onRegister={createProfile}
    />
  );
}

function RegisterDriverContent({
  email,
  onRegister,
}: {
  email: string;
  onRegister: (
    vehicleType: "motor" | "mobil",
    plate: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
}) {
  const router = useRouter();
  const [vehicleType, setVehicleType] = useState<"motor" | "mobil">("motor");
  const [plate, setPlate] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSubmit() {
    if (busy) return;

    const cleanPlate = plate.trim().toUpperCase();

    if (!cleanPlate) {
      setError("Plat kendaraan belum diisi.");
      return;
    }

    if (!/^[A-Z0-9 ]{3,20}$/.test(cleanPlate)) {
      setError("Plat hanya boleh huruf, angka, dan spasi.");
      return;
    }

    setBusy(true);
    setError("");

    const result = await onRegister(vehicleType, cleanPlate);

    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.replace("/");
  }

  async function handleSignOut() {
    if (signingOut || !supabase) return;
    setSigningOut(true);
    await supabase.auth.signOut();
    setSigningOut(false);
  }

  return (
    <Screen>
      <ScreenTitle
        subtitle="Lengkapi data kendaraan dulu, lalu tunggu verifikasi admin."
        title="Daftar driver"
      />

      <Card>
        <Text style={styles.label}>Akun</Text>
        <Text style={styles.email}>{email || "Email belum tersedia"}</Text>
        <Text style={styles.hint}>
          Email ini sudah masuk. Data kendaraan dipakai untuk verifikasi.
        </Text>
      </Card>

      <Card>
        <Text style={styles.label}>Jenis kendaraan</Text>
        <ChoiceTabs
          onChange={(value) => {
            setVehicleType(value);
            setError("");
          }}
          options={vehicles}
          value={vehicleType}
        />

        <Field
          autoCapitalize="characters"
          autoCorrect={false}
          hint="Contoh: BL 1234 ABC."
          label="Plat kendaraan"
          maxLength={20}
          onChangeText={(value) => {
            setPlate(value);
            setError("");
          }}
          placeholder="BL 1234 ABC"
          value={plate}
        />

        <InfoNote message="Setelah daftar, akun dicek admin dulu. Kamu belum bisa mengambil pesanan sampai terverifikasi." />

        {error ? <ErrorNote message={error} /> : null}

        <PrimaryButton
          label="Daftar sebagai driver"
          loading={busy}
          onPress={handleSubmit}
        />

        <SecondaryButton
          disabled={busy || signingOut}
          label={signingOut ? "Keluar..." : "Batal dan keluar"}
          onPress={handleSignOut}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.ink900,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  email: {
    color: colors.ink900,
    fontSize: 16,
    fontWeight: "700",
  },
  hint: {
    color: colors.ink600,
    fontSize: 12,
    lineHeight: 18,
  },
});
