import { Redirect } from "expo-router";
import { BrandHeader, Loading, Screen } from "@/components/ui";
import { LoginForm } from "@/features/auth/login-form";
import { useSession } from "@/lib/session";

export default function MasukScreen() {
  const { session, loading } = useSession();

  if (loading) {
    return <Loading label="Menyiapkan akun driver..." />;
  }

  if (session) {
    return <Redirect href="/" />;
  }

  return (
    <Screen>
      <BrandHeader />
      <LoginForm />
    </Screen>
  );
}
