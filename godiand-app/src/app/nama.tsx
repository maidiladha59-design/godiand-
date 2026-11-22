import { Redirect, useRouter } from "expo-router";
import { useEffect } from "react";
import { BackHandler, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Card,
  ErrorNote,
  Loading,
  SecondaryButton,
} from "@/components/ui";
import { NameScreen } from "@/features/auth/name-screen";
import { useMyProfile } from "@/lib/profile";
import { useSession } from "@/lib/session";
import { colors, space } from "@/lib/theme";

export default function NamaRoute() {
  const { session, loading } = useSession();
  const { profile, loading: profileLoading, error, reload } = useMyProfile();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );

    return () => subscription.remove();
  }, []);

  if (loading) {
    return <Loading label="Menyiapkan akun..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  if (profileLoading) {
    return <Loading label="Menyiapkan profil..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.page}>
          <Text style={styles.title}>Profil belum termuat</Text>
          <Card>
            <ErrorNote message={error} />
            <SecondaryButton label="Coba lagi" onPress={() => void reload()} />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  if (profile?.name?.trim()) {
    return <Redirect href="/" />;
  }

  return <NameScreen onSaved={() => router.replace("/")} />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.mist,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: space.xl,
    gap: space.lg,
  },
  title: {
    color: colors.ink900,
    fontSize: 22,
    fontWeight: "900",
  },
});
