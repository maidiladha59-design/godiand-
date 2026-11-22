import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { BackLink } from "@/components/back-link";
import {
  Card,
  ErrorNote,
  Field,
  Loading,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from "@/components/ui";
import {
  saveMyData,
  useMyProfile,
  validateName,
  validatePhone,
  type MyProfile,
} from "@/lib/profile";
import { colors } from "@/lib/theme";

function DataDiriForm({
  profile,
  onSaved,
}: {
  profile: MyProfile;
  onSaved: () => void;
}) {
  const [name, setName] = useState(profile.name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState("");

  const nameProblem = validateName(name);
  const phoneProblem = validatePhone(phone);
  const valid = nameProblem === null && phoneProblem === null;

  async function handleSave() {
    setTouched(true);
    setSaveError("");

    if (busy || !valid) return;

    setBusy(true);

    const result = await saveMyData({ name, phone });

    if (!result.ok) {
      setBusy(false);
      setSaveError(result.message);
      return;
    }

    onSaved();
  }

  return (
    <>
      <Card>
        <Field
          autoCapitalize="words"
          autoComplete="name"
          hint={
            touched && nameProblem
              ? nameProblem
              : "2–40 karakter. Contoh: Razi."
          }
          label="Nama"
          maxLength={40}
          onChangeText={setName}
          placeholder="Nama panggilanmu"
          textContentType="name"
          value={name}
        />

        <Field
          hint={
            touched && phoneProblem
              ? phoneProblem
              : "Opsional. Contoh: 0858-3404-3432."
          }
          inputMode="tel"
          keyboardType="phone-pad"
          label="Nomor HP"
          maxLength={20}
          onChangeText={setPhone}
          placeholder="Belum diisi"
          value={phone}
        />

        <Field
          editable={false}
          hint="Email dipakai untuk masuk dan tidak bisa diubah di sini."
          label="Email"
          onChangeText={() => {}}
          value={profile.email}
        />

        {saveError ? <ErrorNote message={saveError} /> : null}

        <View>
          <PrimaryButton
            disabled={!valid}
            label="Simpan data diri"
            loading={busy}
            onPress={() => {
              void handleSave();
            }}
          />
        </View>
      </Card>
    </>
  );
}

export function DataDiriScreen() {
  const router = useRouter();
  const { profile, loading, error, reload } = useMyProfile();

  return (
    <Screen>
      <BackLink />

      <View style={styles.head}>
        <Text style={styles.eyebrow}>Profil</Text>
        <Text style={styles.title}>Data diri</Text>
        <Text style={styles.subtitle}>
          Nama ini terlihat oleh driver saat menjemputmu. Nomor HP opsional,
          biar driver bisa menghubungimu kalau perlu.
        </Text>
      </View>

      {loading && !profile ? <Loading label="Memuat data diri..." /> : null}

      {!loading && error && !profile ? (
        <Card>
          <ErrorNote message={error} />
          <SecondaryButton
            label="Coba lagi"
            onPress={() => {
              void reload();
            }}
          />
        </Card>
      ) : null}

      {profile ? (
        <DataDiriForm
          profile={profile}
          onSaved={() => {
            router.back();
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: {
    gap: 4,
  },
  eyebrow: {
    color: colors.brand700,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  title: {
    color: colors.ink900,
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  subtitle: {
    color: colors.ink600,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
});
