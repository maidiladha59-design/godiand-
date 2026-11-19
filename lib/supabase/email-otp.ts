"use client";

import { authErrorMessage } from "@/lib/auth/otp-error";
import {
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
} from "@/lib/auth/validation";
import { getSupabaseBrowserClient } from "./client";

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
          ...(cleanName ? { name: cleanName } : {}),
          ...(cleanPhone ? { phone: cleanPhone } : {}),
        }
      : undefined;

  try {
    const response = await fetch("/api/auth/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, mode, ...(metadata ?? {}) }),
    });

    const data = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    if (!response.ok) {
      return {
        ok: false,
        message: data?.message ?? "Ada masalah. Coba lagi ya.",
      };
    }

    return { ok: true };
  } catch {
    return { ok: false, message: "Koneksi ke server gagal. Coba lagi ya." };
  }
}

export async function verifyEmailOtp(
  emailInput: string,
  tokenInput: string,
): Promise<EmailOtpResult> {
  const email = normalizeEmail(emailInput);
  const token = tokenInput.replace(/\s/g, "");

  if (!isValidEmail(email)) {
    return { ok: false, message: "Format email belum benar." };
  }

  if (!/^\d{6}$/.test(token)) {
    return { ok: false, message: "Kode harus 6 angka." };
  }

  try {
    const { error } = await getSupabaseBrowserClient().auth.verifyOtp({
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
