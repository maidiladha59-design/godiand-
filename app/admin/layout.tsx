import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminAuthProvider } from "@/components/admin/auth-provider";

export const metadata: Metadata = {
  title: {
    default: "Panel admin",
    template: "%s · Admin Godiand",
  },
  description: "Panel operasional Godiand.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
