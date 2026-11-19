import { useCallback, useState } from "react";
import { Redirect, useFocusEffect } from "expo-router";
import Constants from "expo-constants";
import { StyleSheet, Text, View } from "react-native";
import {
  Badge,
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
import { loadProfile, updateProfile } from "@/lib/data/profile";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { colors, space } from "@/lib/theme";

export default function AkunScreen() {
  const { session, loading } = useSession();

  if (loading) {
    return <Loading label="Menyiapkan akun..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  return (
    <AkunContent
      fallbackEmail={session.user.email ?? ""}
      userId={session.user.id}
    />
  );
}

function AkunContent({
  userId,
  fallbackEmail,
}: {
  userId: string;
  fallbackEmail: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(fallbackEmail);
  const [verified, setVerified] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const result = await loadProfile(userId);

    if (result.profile) {
      setName(result.profile.name ?? "");
      setPhone(result.profile.phone ?? "");
      setEmail(result.profile.email || fallbackEmail);
      setVerified(result.profile.email_verified);
    }

    setError(result.error ?? "");
    setLoadingData(false);
  }, [userId, fallbackEmail]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleSave() {
    if (saving) return;

    setSaving(true);
    setError("");
    setNotice("");

    const result = await updateProfile(userId, { name, phone });

    setSaving(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setNotice("Profil tersimpan.");
  }

  async function handleSignOut() {
    if (!supabase || signingOut) return;

    setSigningOut(true);
    setError("");

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError("Gagal keluar. Coba lagi.");
      setSigningOut(false);
    }
  }

  if (loadingData) {
    return <Loading label="Memuat akun..." />;
  }

  return (
    <Screen>
      <ScreenTitle
        subtitle="Nama dan nomor HP dipakai driver untuk menghubungimu."
        title="Akun"
      />

      <Card>
        <Text style={styles.cardTitle}>Profil</Text>

        <Field
          autoCapitalize="words"
          autoComplete="name"
          label="Nama"
          onChangeText={(value) => {
            setName(value);
            setNotice("");
            setError("");
          }}
          placeholder="Nama kamu"
          textContentType="name"
          value={name}
        />

        <Field
          autoComplete="tel"
          hint="Opsional. Tidak diverifikasi; hanya untuk kontak driver."
          inputMode="tel"
          keyboardType="phone-pad"
          label="Nomor HP"
          onChangeText={(value) => {
            setPhone(value);
            setNotice("");
            setError("");
          }}
          placeholder="08xx atau +628xx"
          textContentType="telephoneNumber"
          value={phone}
        />

        {notice ? <InfoNote message={notice} /> : null}

        <PrimaryButton
          label="Simpan profil"
          loading={saving}
          onPress={handleSave}
        />
      </Card>

      <Card>
        <View style={styles.row}>
          <View style={styles.rowMain}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{email}</Text>
          </View>
          {verified ? <Badge label="Terverifikasi" /> : null}
        </View>
        <Text style={styles.hint}>
          Email dipakai untuk masuk lewat kode 6 angka. Belum bisa diganti dari
          aplikasi.
        </Text>
      </Card>

      {error ? <ErrorNote message={error} /> : null}

      <Card>
        <Text style={styles.cardTitle}>Sesi</Text>
        <SecondaryButton
          disabled={signingOut}
          label={signingOut ? "Sedang keluar..." : "Keluar dari akun"}
          onPress={handleSignOut}
        />
      </Card>

      <Text style={styles.footnote}>
        Godiand versi {Constants.expoConfig?.version ?? "0.1.0"} · Banda Aceh
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    color: colors.ink900,
    fontSize: 16,
    fontWeight: "900",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.md,
  },
  rowMain: {
    flexShrink: 1,
    gap: 4,
  },
  label: {
    color: colors.ink500,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  value: {
    color: colors.ink900,
    fontSize: 15,
    fontWeight: "700",
  },
  hint: {
    color: colors.ink600,
    fontSize: 12,
    lineHeight: 18,
  },
  footnote: {
    color: colors.ink500,
    fontSize: 12,
    textAlign: "center",
  },
});
