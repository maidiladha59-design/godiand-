import { Redirect, useLocalSearchParams } from "expo-router";
import { Loading } from "@/components/ui";
import { SearchingScreen } from "@/features/ride/searching-screen";
import { useSession } from "@/lib/session";

export default function MencariDriverRoute() {
  const { session, loading } = useSession();
  const params = useLocalSearchParams<{ id?: string }>();
  const orderId = typeof params.id === "string" ? params.id : null;

  if (loading) {
    return <Loading label="Menyiapkan pesanan..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  if (!orderId) {
    return <Redirect href="/ride" />;
  }

  return <SearchingScreen orderId={orderId} />;
}
