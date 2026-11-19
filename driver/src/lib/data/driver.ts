import type { DriverRow } from "../database.types";
import { supabase } from "../supabase";
import { databaseError } from "./errors";

export type RatingSummary = {
  count: number;
  average: number | null;
};

export async function createDriverProfile(input: {
  userId: string;
  vehicleType: "motor" | "mobil";
  plate: string;
}): Promise<{ driver: DriverRow | null; error: string | null }> {
  if (!supabase) {
    return { driver: null, error: "Supabase belum diatur." };
  }

  const plate = input.plate.trim().toUpperCase();

  if (!plate) {
    return { driver: null, error: "Plat kendaraan belum diisi." };
  }

  if (plate.length > 20) {
    return { driver: null, error: "Plat kendaraan terlalu panjang." };
  }

  const { data, error } = await supabase
    .from("drivers")
    .insert({
      user_id: input.userId,
      vehicle_type: input.vehicleType,
      vehicle_plate: plate,
    })
    .select("*")
    .single();

  if (error) {
    return {
      driver: null,
      error:
        error.code === "23505"
          ? "Akun ini sudah terdaftar sebagai driver."
          : databaseError(error, "Pendaftaran driver belum tersimpan."),
    };
  }

  return { driver: data, error: null };
}

export async function loadRatingSummary(
  driverId: string,
): Promise<{ summary: RatingSummary; error: string | null }> {
  if (!supabase) {
    return { summary: { count: 0, average: null }, error: "Supabase belum diatur." };
  }

  const { data, error } = await supabase
    .from("ratings")
    .select("score")
    .eq("driver_id", driverId);

  if (error) {
    return {
      summary: { count: 0, average: null },
      error: "Penilaian driver belum bisa dimuat.",
    };
  }

  const scores = data ?? [];
  const count = scores.length;
  const average =
    count === 0
      ? null
      : Math.round(
          (scores.reduce((total, item) => total + item.score, 0) / count) * 10,
        ) / 10;

  return { summary: { count, average }, error: null };
}
