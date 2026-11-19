import type { PostgrestError } from "@supabase/supabase-js";

export function adminErrorMessage(
  error: PostgrestError | null | undefined,
  fallback: string,
): string {
  if (!error) return fallback;

  if (error.code === "P0001" && error.message) {
    return error.message;
  }

  if (error.code === "42501") {
    return "Akses admin diperlukan. Masuk dengan akun admin.";
  }

  if (error.code === "23505") {
    return "Data dengan tanggal atau nama itu sudah ada.";
  }

  if (error.code === "23514") {
    return "Isian belum valid. Cek lagi ya.";
  }

  if (error.code === "23503") {
    return "Data terkait tidak ditemukan. Muat ulang halaman ini.";
  }

  if (error.code === "PGRST301") {
    return "Sesi kamu sudah habis. Masuk ulang ya.";
  }

  return fallback;
}
