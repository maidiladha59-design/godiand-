import { Redirect } from "expo-router";
import { useState } from "react";
import { Loading } from "@/components/ui";
import { BerandaContent } from "@/features/beranda/beranda-content";
import { useSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";

export default function BerandaScreen() {
  const { session, loading } = useSession();
  const [signingOut, setSigningOut] = useState(false);

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

  async function handleSignOut() {
    if (!supabase || signingOut) return;
    setSigningOut(true);
    await supabase.auth.signOut();
    setSigningOut(false);
  }

  return (
    <BerandaContent
      displayName={displayName}
      onSignOut={handleSignOut}
      signingOut={signingOut}
    />
  );
}
