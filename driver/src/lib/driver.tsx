import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DriverRow } from "./database.types";
import { createDriverProfile } from "./data/driver";
import { useSession } from "./session";
import { supabase } from "./supabase";

export type DriverProfile = DriverRow;

type DriverState = {
  driver: DriverProfile | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  createProfile: (
    vehicleType: "motor" | "mobil",
    plate: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  updateStatus: (
    status: "offline" | "available",
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
};

const DriverContext = createContext<DriverState | null>(null);

export function DriverProvider({ children }: { children: ReactNode }) {
  const { session, loading: sessionLoading } = useSession();
  const userId = session?.user.id ?? null;

  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!userId || !supabase) {
      setDriver(null);
      setError("");
      setLoadedFor(userId);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("drivers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (queryError) {
      setDriver(null);
      setError("Data driver belum bisa dimuat. Coba lagi ya.");
    } else {
      setDriver(data);
      setError("");
    }

    setLoadedFor(userId);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const createProfile = useCallback(
    async (vehicleType: "motor" | "mobil", plate: string) => {
      if (!userId) {
        return { ok: false as const, message: "Sesi kamu sudah habis." };
      }

      const result = await createDriverProfile({
        userId,
        vehicleType,
        plate,
      });

      if (result.error || !result.driver) {
        return {
          ok: false as const,
          message: result.error ?? "Pendaftaran driver belum tersimpan.",
        };
      }

      setDriver(result.driver);
      setLoadedFor(userId);
      setError("");
      return { ok: true as const };
    },
    [userId],
  );

  const updateStatus = useCallback(
    async (status: "offline" | "available") => {
      if (!driver) {
        return { ok: false as const, message: "Data driver belum siap." };
      }

      if (driver.status === "busy") {
        return {
          ok: false as const,
          message: "Selesaikan pesanan aktif dulu sebelum mengubah status.",
        };
      }

      if (driver.status === status) {
        return { ok: true as const };
      }

      if (!supabase) {
        return { ok: false as const, message: "Supabase belum diatur." };
      }

      const { data, error: updateError } = await supabase
        .from("drivers")
        .update({ status })
        .eq("id", driver.id)
        .select("*")
        .single();

      if (updateError || !data) {
        return {
          ok: false as const,
          message: "Status belum tersimpan. Coba lagi ya.",
        };
      }

      setDriver(data);
      return { ok: true as const };
    },
    [driver],
  );

  const loading =
    Boolean(supabase) && userId !== null && loadedFor !== userId;

  const value = useMemo(
    () => ({
      driver,
      loading: sessionLoading || loading,
      error,
      refresh: load,
      createProfile,
      updateStatus,
    }),
    [
      driver,
      sessionLoading,
      loading,
      error,
      load,
      createProfile,
      updateStatus,
    ],
  );

  return (
    <DriverContext.Provider value={value}>{children}</DriverContext.Provider>
  );
}

export function useDriver(): DriverState {
  const context = useContext(DriverContext);

  if (!context) {
    throw new Error("useDriver harus dipakai di dalam DriverProvider.");
  }

  return context;
}
