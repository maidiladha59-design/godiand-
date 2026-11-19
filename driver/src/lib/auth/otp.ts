import { supabase } from "../supabase";
import { authErrorMessage } from "./messages";
import {
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
} from "./validation";

export type EmailOtpMode = "login" | "register";

export type SendEmailOtpOptions = {
  mode?: EmailOtpMode;
  name?: string;
  phone?: string;
};

export type EmailOtpResult =
  | { ok: true }
  | { ok: false; message: string };

export async function sendEmailOtp(
  emailInput: string,
  options: SendEmailOtpOptions = {},
): Promise<EmailOtpResult> {
  if (!supabase) {
    return { ok: false, message: "Layanan auth belum dikonfigurasi." };
  }

  const email = normalizeEmail(emailInput);
  const { mode = "login", name, phone } = options;
  const cleanName = name?.trim() ?? "";
  const cleanPhone = phone ? normalizePhone(phone) : "";

  if (!isValidEmail(email)) {
    return { ok: false, message: "Format email belum benar." };
  }

  if (mode === "register" && !cleanName) {
    return { ok: false, message: "Nama belum diisi." };
  }

  if (cleanPhone && !isValidPhone(cleanPhone)) {
    return { ok: false, message: "Nomor HP pakai format +62 atau 08." };
  }

  const metadata =
    mode === "register"
      ? {
          name: cleanName,
          ...(cleanPhone ? { phone: cleanPhone } : {}),
        }
      : undefined;

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: mode === "register",
        ...(metadata ? { data: metadata } : {}),
      },
    });

    return error
      ? { ok: false, message: authErrorMessage(error) }
      : { ok: true };
  } catch {
    return { ok: false, message: "Koneksi ke server gagal. Coba lagi ya." };
  }
}

export async function verifyEmailOtp(
  emailInput: string,
  tokenInput: string,
): Promise<EmailOtpResult> {
  if (!supabase) {
    return { ok: false, message: "Layanan auth belum dikonfigurasi." };
  }

  const email = normalizeEmail(emailInput);
  const token = tokenInput.replace(/\s/g, "");

  if (!isValidEmail(email)) {
    return { ok: false, message: "Format email belum benar." };
  }

  if (!/^\d{6}$/.test(token)) {
    return { ok: false, message: "Kode harus 6 angka." };
  }

  try {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    return error
      ? { ok: false, message: authErrorMessage(error) }
      : { ok: true };
  } catch {
    return { ok: false, message: "Koneksi ke server gagal. Coba lagi ya." };
  }
}
