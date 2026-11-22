import { Redirect } from "expo-router";
import { Loading } from "@/components/ui";
import { HapusAkunScreen } from "@/features/profil/hapus-screen";
import { useSession } from "@/lib/session";

export default function HapusAkunRoute() {
  const { session, loading } = useSession();

  if (loading) {
    return <Loading label="Menyiapkan halaman..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  return <HapusAkunScreen />;
}
