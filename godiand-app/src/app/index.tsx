import { Redirect } from "expo-router";
import { Loading } from "@/components/ui";
import { BerandaContent } from "@/features/beranda/beranda-content";
import { useSession } from "@/lib/session";

export default function BerandaScreen() {
  const { session, loading } = useSession();

  if (loading) {
    return <Loading label="Menyiapkan beranda..." />;
  }

  if (!session) {
    return <Redirect href="/masuk" />;
  }

  const rawName = session.user.user_metadata?.name;
  const displayName =
    typeof rawName === "string" && rawName.trim()
      ? rawName.trim()
      : (session.user.email?.split("@")[0] ?? "warga Banda Aceh");

  return <BerandaContent displayName={displayName} />;
}
