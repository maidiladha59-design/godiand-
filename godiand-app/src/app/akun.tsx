import { Redirect } from "expo-router";
import { Loading } from "@/components/ui";
import { AkunScreen } from "@/features/akun/akun-screen";
import { useSession } from "@/lib/session";

export default function AkunRoute() {
  const { session, loading } = useSession();

  if (loading) {
    return <Loading label="Menyiapkan akun..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  return <AkunScreen />;
}
