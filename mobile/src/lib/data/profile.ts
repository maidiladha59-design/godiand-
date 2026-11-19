import type { UserRow } from "../database.types";
import {
  isValidPhone,
  normalizePhone,
} from "../auth/validation";
import { supabase } from "../supabase";
import { databaseError } from "./errors";

export type Profile = Pick<
  UserRow,
  "name" | "email" | "email_verified" | "phone"
>;

export async function loadProfile(
  userId: string,
): Promise<{ profile: Profile | null; error: string | null }> {
  if (!supabase) {
    return { profile: null, error: "Supabase belum diatur." };
  }

  const { data, error } = await supabase
    .from("users")
    .select("name, email, email_verified, phone")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return { profile: null, error: "Profil belum bisa dimuat. Coba lagi ya." };
  }

  return { profile: data ?? null, error: null };
}

export async function updateProfile(
  userId: string,
  input: { name: string; phone: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!supabase) {
    return { ok: false, message: "Supabase belum diatur." };
  }

  const name = input.name.trim();
  const phone = input.phone.trim() ? normalizePhone(input.phone) : "";

  if (!name) {
    return { ok: false, message: "Nama belum diisi." };
  }

  if (name.length > 80) {
    return { ok: false, message: "Nama maksimal 80 karakter." };
  }

  if (phone && !isValidPhone(phone)) {
    return { ok: false, message: "Nomor HP pakai format +62 atau 08." };
  }

  const { error } = await supabase
    .from("users")
    .update({ name, phone: phone || null })
    .eq("id", userId);

  if (error) {
    return {
      ok: false,
      message: databaseError(error, "Profil belum tersimpan. Coba lagi."),
    };
  }

  return { ok: true };
}
