import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Card,
  ErrorNote,
  Field,
  InfoNote,
  PrimaryButton,
} from "@/components/ui";
import { submitRating } from "@/lib/data/orders";
import { colors, hardShadow, radius, space } from "@/lib/theme";

const scores = [1, 2, 3, 4, 5];

export function RatingForm({
  orderId,
  userId,
  driverId,
  onSubmitted,
}: {
  orderId: string;
  userId: string;
  driverId: string;
  onSubmitted: () => void;
}) {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (busy || done) return;

    if (score < 1) {
      setError("Pilih nilai dulu ya.");
      return;
    }

    setBusy(true);
    setError("");

    const result = await submitRating({
      orderId,
      raterId: userId,
      driverId,
      score,
      comment,
    });

    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setDone(true);
    onSubmitted();
  }

  if (done) {
    return (
      <Card>
        <Text style={styles.title}>Terima kasih</Text>
        <InfoNote message="Penilaianmu sudah terkirim." />
      </Card>
    );
  }

  return (
    <Card>
      <Text style={styles.title}>Nilai driver</Text>
      <Text style={styles.subtitle}>
        Seberapa puas dengan layanan pesanan ini?
      </Text>

      <View style={styles.scores}>
        {scores.map((value) => {
          const active = value === score;

          return (
            <Pressable
              accessibilityLabel={`Beri nilai ${value} dari 5`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              key={value}
              onPress={() => {
                setScore(value);
                setError("");
              }}
              style={({ pressed }) => [
                styles.score,
                active && styles.scoreActive,
                pressed && styles.scorePressed,
              ]}
            >
              <Text style={[styles.scoreText, active && styles.scoreTextActive]}>
                {value}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.scale}>1 = kurang, 5 = sangat baik</Text>

      <Field
        hint="Opsional, maksimal 500 karakter."
        label="Komentar"
        maxLength={500}
        multiline
        numberOfLines={3}
        onChangeText={(value) => {
          setComment(value);
          setError("");
        }}
        placeholder="Ceritakan pengalamanmu (opsional)."
        value={comment}
      />

      {error ? <ErrorNote message={error} /> : null}

      <PrimaryButton
        label="Kirim penilaian"
        loading={busy}
        onPress={handleSubmit}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.ink900,
    fontSize: 16,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.ink600,
    fontSize: 13,
    lineHeight: 19,
  },
  scores: {
    flexDirection: "row",
    gap: space.sm,
  },
  score: {
    flex: 1,
    minHeight: 48,
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    ...hardShadow,
  },
  scoreActive: {
    backgroundColor: colors.brand600,
  },
  scorePressed: {
    backgroundColor: colors.sun50,
  },
  scoreText: {
    color: colors.ink900,
    fontSize: 18,
    fontWeight: "900",
  },
  scoreTextActive: {
    color: colors.white,
  },
  scale: {
    color: colors.ink600,
    fontSize: 12,
  },
});
