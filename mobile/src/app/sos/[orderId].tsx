import { useState } from "react";
import {
  Redirect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { StyleSheet, Text } from "react-native";
import { ChoiceTabs, type ChoiceOption } from "@/components/choice-tabs";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  DangerButton,
  ErrorNote,
  Field,
  InfoNote,
  Loading,
  Screen,
  SecondaryButton,
} from "@/components/ui";
import type { SosCategory } from "@/lib/database.types";
import { sendSosReport } from "@/lib/data/orders";
import { useSession } from "@/lib/session";
import { colors, space } from "@/lib/theme";

const categories: ChoiceOption<SosCategory>[] = [
  { value: "darurat", label: "Darurat" },
  { value: "kecelakaan", label: "Kecelakaan" },
  { value: "pelecehan", label: "Pelecehan" },
  { value: "lainnya", label: "Lainnya" },
];

export default function SosScreen() {
  const { session, loading } = useSession();
  const params = useLocalSearchParams<{ orderId?: string }>();

  if (loading) {
    return <Loading label="Menyiapkan laporan..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  if (!params.orderId) {
    return <Redirect href="/" />;
  }

  return (
    <SosContent orderId={params.orderId} userId={session.user.id} />
  );
}

function SosContent({
  orderId,
  userId,
}: {
  orderId: string;
  userId: string;
}) {
  const router = useRouter();
  const [category, setCategory] = useState<SosCategory>("darurat");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (busy) return;

    setBusy(true);
    setError("");

    const result = await sendSosReport({
      orderId,
      reportedBy: userId,
      category,
      message,
    });

    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <Screen>
        <PageHeader title="Laporan SOS" />
        <Card>
          <Text style={styles.title}>Laporan terkirim</Text>
          <Text style={styles.body}>
            Laporan sudah tersimpan untuk pesanan ini. Kalau nyawa terancam,
            hubungi 112 atau 110 sekarang.
          </Text>
          <SecondaryButton
            label="Kembali ke pesanan"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
                return;
              }

              router.replace(`/pesanan/${orderId}`);
            }}
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader
        subtitle="Untuk kejadian darurat yang terkait pesanan ini."
        title="Lapor darurat"
      />

      <InfoNote message="Gunakan hanya saat benar-benar darurat. Kalau nyawa terancam, telepon 112 atau 110 lebih dulu." />

      <Card>
        <Text style={styles.label}>Jenis kejadian</Text>
        <ChoiceTabs
          onChange={(value) => {
            setCategory(value);
            setError("");
          }}
          options={categories}
          value={category}
        />

        <Field
          hint="Opsional. Sebutkan patokan tempat karena lokasi tidak dikirim otomatis."
          label="Ceritakan kejadian"
          maxLength={500}
          multiline
          numberOfLines={4}
          onChangeText={(value) => {
            setMessage(value);
            setError("");
          }}
          placeholder="Contoh: di depan Pasar Aceh, driver meminta uang tambahan."
          value={message}
        />

        {error ? <ErrorNote message={error} /> : null}

        <DangerButton
          label="Kirim laporan SOS"
          loading={busy}
          onPress={handleSubmit}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
  },
  body: {
    color: colors.ink700,
    fontSize: 14,
    lineHeight: 21,
  },
  label: {
    color: colors.ink900,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
    marginBottom: space.xs,
  },
});
