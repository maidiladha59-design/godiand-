import { Redirect } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, ErrorNote, Loading, SecondaryButton } from "@/components/ui";
import { BerandaContent } from "@/features/beranda/beranda-content";
import { useMyProfile } from "@/lib/profile";
import { useSession } from "@/lib/session";
import { colors, space } from "@/lib/theme";

export default function BerandaScreen() {
  const { session, loading } = useSession();
  const {
    profile,
    loading: profileLoading,
    error,
    reload,
  } = useMyProfile();

  if (loading) {
    return <Loading label="Menyiapkan beranda..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  if (profileLoading) {
    return <Loading label="Menyiapkan beranda..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.page}>
          <Text style={styles.title}>Beranda belum termuat</Text>
          <Card>
            <ErrorNote message={error} />
            <SecondaryButton label="Coba lagi" onPress={() => void reload()} />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  const name = profile?.name?.trim();

  if (!name) {
    return <Redirect href="/nama" />;
  }

  return <BerandaContent displayName={name} />;
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
