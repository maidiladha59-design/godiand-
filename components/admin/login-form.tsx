"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAdminAuth } from "@/components/admin/auth-provider";
import {
  AdminButton,
  ErrorNote,
  SuccessNote,
  TextField,
} from "@/components/admin/ui";
import { loadAdminIdentity } from "@/lib/admin/data";
import { normalizeEmail } from "@/lib/auth/validation";
import { sendEmailOtp, verifyEmailOtp } from "@/lib/supabase/email-otp";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Step = "email" | "code" | "done";

export function AdminLoginForm() {
  const router = useRouter();
  const { configured, loading, isAdmin, error: authError, refresh } =
    useAdminAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      router.replace("/admin");
    }
  }, [isAdmin, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(
      () => setCooldown((value) => value - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setError("");
    setNotice("");
    setPending(true);

    const result = await sendEmailOtp(email, { mode: "login" });
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSentEmail(normalizeEmail(email));
    setCode("");
    setStep("code");
    setCooldown(60);
    setNotice("Kode 6 angka sudah dikirim ke email admin.");
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;

    setError("");
    setNotice("");
    setResending(true);
    const result = await sendEmailOtp(sentEmail, { mode: "login" });
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
    if (pending) return;

    setError("");
    setNotice("");
    setPending(true);

    const verified = await verifyEmailOtp(sentEmail, code);
    if (!verified.ok) {
      setPending(false);
      setError(verified.message);
      return;
    }

    const { data, error: userError } = await getSupabaseBrowserClient()
      .auth.getUser();

    if (userError || !data.user) {
      await getSupabaseBrowserClient().auth.signOut();
      setPending(false);
      setError("Sesi belum siap. Coba kirim kode lagi.");
      return;
    }

    const identity = await loadAdminIdentity(data.user.id);

    if (!identity.ok) {
      setPending(false);
      setError(identity.message);
      return;
    }

    if (!identity.data.isAdmin) {
      await getSupabaseBrowserClient().auth.signOut();
      setPending(false);
      setCode("");
      setStep("email");
      setError(
        "Email ini bukan admin Godiand. Akun admin dibuat manual di dashboard Supabase.",
      );
      return;
    }

    await refresh();
    setPending(false);
    setStep("done");
    router.replace("/admin");
  }

  if (!configured) {
    return (
      <div className="gd-card p-6">
        <h1 className="text-xl font-extrabold tracking-tight">
          Supabase belum diatur
        </h1>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-ink-600">
          Isi <code className="font-extrabold">.env.local</code> di root proyek
          dengan <code>NEXT_PUBLIC_SUPABASE_URL</code> dan{" "}
          <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>, lalu jalankan ulang
          server.
        </p>
        <p className="mt-3 text-xs font-semibold leading-relaxed text-ink-500">
          Nilai publishable aman di client. Jangan pernah memakai service_role
          atau secret key di sini.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="gd-card p-6 text-sm font-extrabold text-ink-700">
        Memeriksa sesi admin...
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="gd-card p-6 text-center">
        <p className="text-lg font-extrabold">Masuk sebagai admin</p>
        <p className="mt-1 text-sm font-semibold text-ink-600">
          Membuka panel admin...
        </p>
      </div>
    );
  }

  return (
    <div className="gd-card p-5 sm:p-7">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-700">
        Godiand Admin
      </p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
        {step === "code" ? "Masukkan kode" : "Masuk panel admin"}
      </h1>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-ink-600">
        {step === "code"
          ? `Kode dikirim ke ${sentEmail}.`
          : "Hanya akun yang terdaftar sebagai admin yang bisa masuk."}
      </p>

      {authError ? (
        <div className="mt-4">
          <ErrorNote message={authError} />
        </div>
      ) : null}

      {error ? (
        <div className="mt-4">
          <ErrorNote message={error} />
        </div>
      ) : null}

      {notice ? (
        <div className="mt-4">
          <SuccessNote message={notice} />
        </div>
      ) : null}

      {step === "email" ? (
        <form className="mt-5 space-y-4" onSubmit={handleSend} noValidate>
          <TextField
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            inputMode="email"
            label="Email admin"
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            placeholder="nama@email.com"
            spellCheck={false}
            type="email"
            value={email}
          />
          <AdminButton className="w-full" loading={pending} type="submit">
            Kirim kode
          </AdminButton>
          <p className="text-center text-xs font-semibold leading-relaxed text-ink-500">
            Tanpa password. Kode 6 angka dikirim ke email.
          </p>
        </form>
      ) : (
        <form className="mt-5 space-y-4" onSubmit={handleVerify} noValidate>
          <TextField
            autoComplete="one-time-code"
            className="text-center text-2xl tracking-[0.4em]"
            inputMode="numeric"
            label="Kode 6 angka"
            maxLength={6}
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            pattern="[0-9]*"
            placeholder="000000"
            type="text"
            value={code}
          />
          <AdminButton className="w-full" loading={pending} type="submit">
            Verifikasi dan masuk
          </AdminButton>
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
                  ? `Kirim ulang (${cooldown}s)`
                  : "Kirim ulang kode"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError("");
                setNotice("");
                setCooldown(0);
              }}
              className="text-sm font-bold text-ink-600 underline underline-offset-4"
            >
              Ubah email
            </button>
          </div>
        </form>
      )}

      <p className="mt-5 rounded-xl border-2 border-ink-900/20 bg-mist px-3 py-2.5 text-xs font-semibold leading-relaxed text-ink-600">
        Akun admin tidak didaftarkan dari halaman ini. Buat akun lewat halaman
        masuk biasa, lalu tambahkan ke tabel <code>admins</code> di dashboard
        Supabase.
      </p>
    </div>
  );
}
