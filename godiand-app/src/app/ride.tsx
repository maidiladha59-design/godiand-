import { Redirect } from "expo-router";
import { Loading } from "@/components/ui";
import { RideScreen } from "@/features/ride/ride-screen";
import { useSession } from "@/lib/session";

export default function RideRoute() {
  const { session, loading } = useSession();

  if (loading) {
    return <Loading label="Menyiapkan GoDiandRide..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  return <RideScreen />;
}
