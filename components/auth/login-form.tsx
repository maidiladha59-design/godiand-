"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "@/components/icons";
import {
  isValidPhone,
  normalizeEmail,
  normalizePhone,
} from "@/lib/auth/validation";
import {
  sendEmailOtp,
  verifyEmailOtp,
  type EmailOtpMode,
} from "@/lib/supabase/email-otp";

type Step = "email" | "code" | "done";

type SentCode = {
  email: string;
  name: string;
  phone: string;
};

const inputClass =
  "mt-2 w-full rounded-xl border-2 border-ink-900 bg-white px-3.5 py-3 text-[15px] font-semibold text-ink-900 placeholder:font-medium placeholder:text-ink-500";

export function LoginForm() {
  const [mode, setMode] = useState<EmailOtpMode>("login");
  const [step, setStep] = useState<Step>("email");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState<SentCode | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(
      () => setCooldown((value) => value - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  function switchMode(next: EmailOtpMode) {
    if (next === mode || pending) return;
    setMode(next);
    setStep("email");
    setCode("");
    setSent(null);
    setError("");
    setNotice("");
    setCooldown(0);
  }

  function backToEmail() {
    setStep("email");
    setCode("");
    setSent(null);
    setError("");
    setNotice("");
    setCooldown(0);
  }

  async function handleSendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setError("");
    setNotice("");

    const cleanName = name.trim();
    const cleanPhone = phone.trim() ? normalizePhone(phone) : "";

    if (mode === "register" && !cleanName) {
      setError("Nama belum diisi.");
      return;
    }

    if (cleanPhone && !isValidPhone(cleanPhone)) {
      setError("Nomor HP pakai format +62 atau 08.");
      return;
    }

    setPending(true);
    const result = await sendEmailOtp(email, {
      mode,
      name: cleanName,
      phone: cleanPhone,
    });
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSent({
      email: normalizeEmail(email),
      name: cleanName,
      phone: cleanPhone,
    });
    setStep("code");
    setCode("");
    setCooldown(60);
    setNotice("Kode 6 digit sudah dikirim. Cek email, ya.");
  }

  async function handleResend() {
    if (!sent || cooldown > 0 || resending) return;

    setError("");
    setNotice("");
    setResending(true);
    const result = await sendEmailOtp(sent.email, {
      mode,
      name: sent.name,
      phone: sent.phone,
    });
    setResending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setCode("");
    setCooldown(60);
    setNotice("Kode baru sudah dikirim.");
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sent || pending) return;

    setError("");
    setNotice("");
    setPending(true);
    const result = await verifyEmailOtp(sent.email, code);
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setStep("done");
  }

  return (
    <div className="gd-card gd-up p-5 sm:p-7">
      {step === "done" ? (
        <div className="py-6 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-ink-900 bg-mint-600 text-white shadow-gd">
            <Icon name="check" size={30} strokeWidth={2.6} />
          </span>
          <h2 className="mt-5 text-2xl font-extrabold tracking-tight">
            Kamu sudah masuk
          </h2>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-ink-600">
            {sent ? `${sent.email} sudah terverifikasi.` : "Email sudah terverifikasi."}
          </p>
          <Link href="/" className="gd-btn gd-btn-primary mt-6 w-full">
            Ke beranda
            <Icon name="arrow-right" size={17} />
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-ink-500">
                Akun GoDiand
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
                {step === "code"
                  ? "Masukkan kode"
                  : mode === "login"
                    ? "Masuk"
                    : "Daftar"}
              </h2>
            </div>
            <span
              aria-hidden="true"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-ink-900 bg-sun-400 text-ink-900"
            >
              <Icon name={step === "code" ? "shield" : "user"} size={21} />
            </span>
          </div>

          {step === "email" ? (
            <div
              role="group"
              aria-label="Pilih masuk atau daftar"
              className="mt-5 grid grid-cols-2 gap-1 rounded-xl border-2 border-ink-900 bg-mist p-1"
            >
              <button
                type="button"
                aria-pressed={mode === "login"}
                onClick={() => switchMode("login")}
                disabled={pending}
                className={`rounded-lg px-3 py-2 text-sm font-extrabold transition ${
                  mode === "login"
                    ? "bg-brand-600 text-white"
                    : "text-ink-600 hover:bg-white hover:text-ink-900"
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                aria-pressed={mode === "register"}
                onClick={() => switchMode("register")}
                disabled={pending}
                className={`rounded-lg px-3 py-2 text-sm font-extrabold transition ${
                  mode === "register"
                    ? "bg-brand-600 text-white"
                    : "text-ink-600 hover:bg-white hover:text-ink-900"
                }`}
              >
                Daftar
              </button>
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="mt-4 flex gap-2 rounded-xl border-2 border-coral-600 bg-coral-50 px-3.5 py-3 text-sm font-semibold text-coral-700"
            >
              <Icon name="alert" size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {notice ? (
            <p
              aria-live="polite"
              className="mt-4 rounded-xl border-2 border-mint-600 bg-mint-50 px-3.5 py-3 text-sm font-semibold text-mint-700"
            >
              {notice}
            </p>
          ) : null}

          {step === "email" ? (
            <form className="mt-5 space-y-4" onSubmit={handleSendCode} noValidate>
              {mode === "register" ? (
                <label className="block">
                  <span className="text-sm font-extrabold">Nama</span>
                  <input
                    type="text"
                    autoComplete="name"
                    maxLength={80}
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setError("");
                    }}
                    placeholder="Nama kamu"
                    className={inputClass}
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="text-sm font-extrabold">Email</span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="nama@email.com"
                  className={inputClass}
                />
              </label>

              {mode === "register" ? (
                <label className="block">
                  <span className="flex items-center justify-between gap-3 text-sm font-extrabold">
                    Nomor HP
                    <span className="text-[11px] font-bold uppercase tracking-wide text-ink-500">
                      Opsional
                    </span>
                  </span>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={20}
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      setError("");
                    }}
                    placeholder="0812... atau +62..."
                    aria-describedby="phone-hint"
                    className={inputClass}
                  />
                  <span
                    id="phone-hint"
                    className="mt-1.5 block text-xs font-semibold text-ink-500"
                  >
                    Buat dihubungi driver. Tidak diverifikasi.
                  </span>
                </label>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="gd-btn gd-btn-primary w-full disabled:pointer-events-none disabled:opacity-70"
              >
                {pending
                  ? "Mengirim kode..."
                  : mode === "login"
                    ? "Kirim kode"
                    : "Daftar & kirim kode"}
                <Icon name="arrow-right" size={17} />
              </button>

              <p className="text-center text-xs font-semibold leading-relaxed text-ink-500">
                Tanpa password. Kode 6 digit dikirim ke email.
              </p>
            </form>
          ) : (
            <form className="mt-5 space-y-4" onSubmit={handleVerify} noValidate>
              <p className="text-sm font-semibold leading-relaxed text-ink-600">
                Kode dikirim ke{" "}
                <span className="font-extrabold text-ink-900">{sent?.email}</span>
              </p>

              <label className="block">
                <span className="text-sm font-extrabold">Kode 6 digit</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                  }}
                  placeholder="000000"
                  autoFocus
                  className={`${inputClass} text-center text-2xl tracking-[0.45em] sm:text-3xl`}
                />
              </label>

              <button
                type="submit"
                disabled={pending}
                className="gd-btn gd-btn-primary w-full disabled:pointer-events-none disabled:opacity-70"
              >
                {pending ? "Memeriksa kode..." : "Verifikasi & masuk"}
                <Icon name="arrow-right" size={17} />
              </button>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resending}
                  className="text-sm font-extrabold text-brand-700 underline underline-offset-4 disabled:cursor-not-allowed disabled:text-ink-500 disabled:no-underline"
                >
                  {resending
                    ? "Mengirim..."
                    : cooldown > 0
                      ? `Kirim ulang kode (${cooldown}s)`
                      : "Kirim ulang kode"}
                </button>
                <button
                  type="button"
                  onClick={backToEmail}
                  className="text-sm font-bold text-ink-600 underline underline-offset-4"
                >
                  Ubah email
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
