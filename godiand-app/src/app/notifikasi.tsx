import { Redirect } from "expo-router";
import { Loading } from "@/components/ui";
import { NotifikasiScreen } from "@/features/notifikasi/notifikasi-screen";
import { useSession } from "@/lib/session";

export default function NotifikasiRoute() {
  const { session, loading } = useSession();

  if (loading) {
    return <Loading label="Menyiapkan notifikasi..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  return <NotifikasiScreen />;
}
