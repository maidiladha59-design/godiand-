import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useSession } from "./session";

export type MyProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
};

export const nameError = {
  empty: "Nama wajib diisi.",
  tooShort: "Nama minimal 2 karakter.",
  tooLong: "Nama maksimal 40 karakter.",
} as const;

export function normalizeName(input: string): string {
  return input.trim();
}

export function validateName(input: string): string | null {
  const value = normalizeName(input);

  if (!value) return nameError.empty;
  if (value.length < 2) return nameError.tooShort;
  if (value.length > 40) return nameError.tooLong;

  return null;
}

export function normalizePhone(input: string): string {
  return input.trim();
}

export function validatePhone(input: string): string | null {
  const value = normalizePhone(input);

  if (!value) return null;

  if (!/^\+?[0-9][0-9\s-]*$/.test(value)) {
    return "Nomor HP hanya berisi angka, spasi, tanda +, atau -.";
  }

  const digits = value.replace(/\D/g, "");

  if (digits.length < 9 || digits.length > 15) {
    return "Nomor HP harus 9–15 angka.";
  }

  return null;
}

export async function fetchMyProfile(): Promise<MyProfile | null> {
  if (!supabase) {
    throw new Error("Layanan akun belum dikonfigurasi.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, phone")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error("Profil belum bisa dimuat. Coba lagi ya.");
  }

  return data;
}

export async function saveMyName(
  input: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!supabase) {
    return { ok: false, message: "Layanan akun belum dikonfigurasi." };
  }

  const problem = validateName(input);

  if (problem) {
    return { ok: false, message: problem };
  }

  const name = normalizeName(input);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "Sesi sudah berakhir. Masuk lagi ya." };
    }

    const { data, error } = await supabase
      .from("users")
      .update({ name })
      .eq("id", user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return {
        ok: false,
        message: "Nama belum tersimpan. Periksa koneksi lalu coba lagi.",
      };
    }

    if (!data) {
      return {
        ok: false,
        message: "Profil belum siap. Coba keluar lalu masuk lagi ya.",
      };
    }

    await supabase.auth.updateUser({ data: { name } }).catch(() => {});

    return { ok: true };
  } catch {
    return {
      ok: false,
      message: "Koneksi ke server gagal. Coba lagi ya.",
    };
  }
}

export type SaveResult = { ok: true } | { ok: false; message: string };

export async function saveMyData(input: {
  name: string;
  phone: string;
}): Promise<SaveResult> {
  if (!supabase) {
    return { ok: false, message: "Layanan akun belum dikonfigurasi." };
  }

  const nameProblem = validateName(input.name);

  if (nameProblem) {
    return { ok: false, message: nameProblem };
  }

  const phoneProblem = validatePhone(input.phone);

  if (phoneProblem) {
    return { ok: false, message: phoneProblem };
  }

  const name = normalizeName(input.name);
  const phone = normalizePhone(input.phone) || null;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "Sesi sudah berakhir. Masuk lagi ya." };
    }

    const { data, error } = await supabase
      .from("users")
      .update({ name, phone })
      .eq("id", user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return {
        ok: false,
        message: "Data diri belum tersimpan. Periksa koneksi lalu coba lagi.",
      };
    }

    if (!data) {
      return {
        ok: false,
        message: "Profil belum siap. Coba keluar lalu masuk lagi ya.",
      };
    }

    await supabase.auth.updateUser({ data: { name } }).catch(() => {});

    return { ok: true };
  } catch {
    return {
      ok: false,
      message: "Koneksi ke server gagal. Coba lagi ya.",
    };
  }
}

export function useMyProfile() {
  const { session } = useSession();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(session));
  const [error, setError] = useState("");

  const userId = session?.user.id;

  const load = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      setProfile(await fetchMyProfile());
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Profil belum bisa dimuat. Coba lagi ya.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { profile, loading, error, reload: load };
}
