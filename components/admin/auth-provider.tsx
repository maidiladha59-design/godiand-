"use client";

import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { loadAdminIdentity, type UserBrief } from "@/lib/admin/data";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";

type AdminAuthState = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  profile: UserBrief | null;
  role: "admin" | "operator" | null;
  isAdmin: boolean;
  error: string;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserBrief | null>(null);
  const [role, setRole] = useState<"admin" | "operator" | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const current = ++requestId.current;

    if (!isSupabaseConfigured) {
      setLoading(false);
      setError(
        "Supabase belum diatur. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY di .env.local.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (requestId.current !== current) return;

      if (sessionError) {
        setError("Sesi admin belum bisa diperiksa. Coba muat ulang.");
        setLoading(false);
        return;
      }

      const currentSession = data.session;
      setSession(currentSession);

      if (!currentSession) {
        setProfile(null);
        setRole(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const identity = await loadAdminIdentity(currentSession.user.id);
      if (requestId.current !== current) return;

      if (!identity.ok) {
        setError(identity.message);
        setProfile(null);
        setRole(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setProfile(identity.data.profile);
      setRole(identity.data.role);
      setIsAdmin(identity.data.isAdmin);
      setLoading(false);
    } catch {
      if (requestId.current !== current) return;
      setError("Panel admin belum bisa dimuat. Coba muat ulang.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = getSupabaseBrowserClient();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION") return;
      window.setTimeout(() => {
        void refresh();
      }, 0);
    });

    return () => data.subscription.unsubscribe();
  }, [refresh]);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    await getSupabaseBrowserClient().auth.signOut();
    setSession(null);
    setProfile(null);
    setRole(null);
    setIsAdmin(false);
    setError("");
  }, []);

  const value = useMemo<AdminAuthState>(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      session,
      profile,
      role,
      isAdmin,
      error,
      refresh,
      signOut,
    }),
    [loading, session, profile, role, isAdmin, error, refresh, signOut],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthState {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth harus dipakai di dalam AdminAuthProvider.");
  }

  return context;
}
