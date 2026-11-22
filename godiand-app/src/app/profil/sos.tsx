import { Redirect } from "expo-router";
import { Loading } from "@/components/ui";
import { SosScreen } from "@/features/profil/sos-screen";
import { useSession } from "@/lib/session";

export default function SosRoute() {
  const { session, loading } = useSession();

  if (loading) {
    return <Loading label="Menyiapkan halaman..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  return <SosScreen />;
}
