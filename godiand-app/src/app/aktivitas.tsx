import { Redirect } from "expo-router";
import { Loading } from "@/components/ui";
import { AktivitasScreen } from "@/features/aktivitas/aktivitas-screen";
import { useSession } from "@/lib/session";

export default function AktivitasRoute() {
  const { session, loading } = useSession();

  if (loading) {
    return <Loading label="Menyiapkan aktivitas..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  return <AktivitasScreen />;
}
