"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAdminAuth } from "@/components/admin/auth-provider";
import { LoadingState } from "@/components/admin/ui";

export default function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { loading, isAdmin, profile, session, role, signOut } = useAdminAuth();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/admin/masuk");
    }
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
        <div className="w-full">
          <LoadingState label="Memeriksa akses admin..." />
        </div>
      </main>
    );
  }

  return (
    <AdminShell
      email={profile?.email ?? session?.user.email ?? ""}
      name={profile?.name ?? null}
      onSignOut={async () => {
        await signOut();
        router.replace("/admin/masuk");
      }}
      role={role}
    >
      {children}
    </AdminShell>
  );
}
