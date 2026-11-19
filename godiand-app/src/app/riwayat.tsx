import { Redirect } from "expo-router";
import { Loading } from "@/components/ui";
import { RiwayatScreen } from "@/features/riwayat/riwayat-screen";
import { useSession } from "@/lib/session";

export default function RiwayatRoute() {
  const { session, loading } = useSession();

  if (loading) {
    return <Loading label="Menyiapkan riwayat..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  return <RiwayatScreen />;
}
