import { Redirect } from "expo-router";
import { Loading } from "@/components/ui";
import { ProfilScreen } from "@/features/profil/profil-screen";
import { useSession } from "@/lib/session";

export default function ProfilRoute() {
  const { session, loading } = useSession();

  if (loading) {
    return <Loading label="Menyiapkan profil..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  return <ProfilScreen />;
}
