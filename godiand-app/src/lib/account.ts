import { supabase } from "./supabase";

export async function deleteMyAccount(): Promise<void> {
  if (!supabase) {
    throw new Error("Layanan akun belum dikonfigurasi.");
  }

  const { error } = await supabase.functions.invoke("delete-account");

  if (!error) return;

  const message = error.message ?? "";

  if (/failed to send|not found|404/i.test(message)) {
    throw new Error(
      "Fitur hapus akun belum aktif di server. Hubungi admin GoDiand.",
    );
  }

  if (/jwt|session|401|unauthorized/i.test(message)) {
    throw new Error("Sesi kamu sudah berakhir. Masuk ulang ya.");
  }

  throw new Error(
    "Akun belum bisa dihapus. Coba lagi atau hubungi admin GoDiand.",
  );
}
