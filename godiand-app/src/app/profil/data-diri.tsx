import { Redirect } from "expo-router";
import { Loading } from "@/components/ui";
import { DataDiriScreen } from "@/features/profil/data-diri-screen";
import { useSession } from "@/lib/session";

export default function DataDiriRoute() {
  const { session, loading } = useSession();

  if (loading) {
    return <Loading label="Menyiapkan data diri..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  return <DataDiriScreen />;
}
