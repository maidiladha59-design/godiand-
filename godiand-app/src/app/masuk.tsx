import { Redirect } from "expo-router";
import { Loading } from "@/components/ui";
import { LoginForm } from "@/features/auth/login-form";
import { useSession } from "@/lib/session";

export default function MasukScreen() {
  const { session, loading } = useSession();

  if (loading) {
    return <Loading label="Menyiapkan akun..." />;
  }

  if (session) {
    return <Redirect href="/nama" />;
  }

  return <LoginForm />;
}
