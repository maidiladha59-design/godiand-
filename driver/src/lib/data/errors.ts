import type { PostgrestError } from "@supabase/supabase-js";

export function databaseError(error: PostgrestError, fallback: string): string {
  // Pesan dari fungsi database (raise exception) sudah berbahasa Indonesia.
  if (error.code === "P0001" && error.message) {
    return error.message;
  }

  if (error.code === "42501") {
    return "Kamu tidak punya akses untuk tindakan ini.";
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
