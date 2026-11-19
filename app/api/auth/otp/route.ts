import { createClient } from "@supabase/supabase-js";
import { authErrorMessage } from "@/lib/auth/otp-error";
import {
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
} from "@/lib/auth/validation";

const WINDOW_MS = 10 * 60 * 1000;
const EMAIL_LIMIT = 5;
const IP_LIMIT = 10;
const COOLDOWN_MS = 60 * 1000;

type Bucket = {
  count: number;
  resetAt: number;
};

const emailBuckets = new Map<string, Bucket>();
const ipBuckets = new Map<string, Bucket>();
const lastSentAt = new Map<string, number>();

function prune(now: number) {
  if (emailBuckets.size + ipBuckets.size + lastSentAt.size < 500) return;

  for (const [key, bucket] of emailBuckets) {
    if (bucket.resetAt <= now) emailBuckets.delete(key);
  }
  for (const [key, bucket] of ipBuckets) {
    if (bucket.resetAt <= now) ipBuckets.delete(key);
  }
  for (const [key, sentAt] of lastSentAt) {
    if (now - sentAt >= COOLDOWN_MS) lastSentAt.delete(key);
  }
}

function retryAfter(
  buckets: Map<string, Bucket>,
  key: string,
  limit: number,
  now: number,
) {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now || bucket.count < limit) return 0;
  return Math.ceil((bucket.resetAt - now) / 1000);
}

function consume(
  buckets: Map<string, Bucket>,
  key: string,
  now: number,
) {
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  bucket.count += 1;
}

function release(
  buckets: Map<string, Bucket>,
  key: string,
  now: number,
) {
  const bucket = buckets.get(key);
  if (!bucket) return;

  if (bucket.resetAt <= now || bucket.count <= 1) {
    buckets.delete(key);
    return;
  }

  bucket.count -= 1;
}

function reply(
  data: { ok: true } | { ok: false; message: string },
  status = 200,
  retryAfterSeconds = 0,
) {
  return Response.json(data, {
    status,
    headers:
      retryAfterSeconds > 0
        ? { "Retry-After": String(retryAfterSeconds) }
        : undefined,
  });
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "local";
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 4096) {
    return reply({ ok: false, message: "Permintaan terlalu besar." }, 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return reply({ ok: false, message: "Permintaan tidak valid." }, 400);
  }

  if (!body || typeof body !== "object") {
    return reply({ ok: false, message: "Permintaan tidak valid." }, 400);
  }

  const input = body as Record<string, unknown>;
  const rawMode = input.mode ?? "login";
  if (rawMode !== "login" && rawMode !== "register") {
    return reply({ ok: false, message: "Permintaan tidak valid." }, 400);
  }
  const mode = rawMode;

  if (typeof input.email !== "string") {
    return reply({ ok: false, message: "Email belum diisi." }, 400);
  }

  const email = normalizeEmail(input.email);
  if (email.length > 254 || !isValidEmail(email)) {
    return reply({ ok: false, message: "Format email belum benar." }, 400);
  }

  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (mode === "register" && !name) {
    return reply({ ok: false, message: "Nama belum diisi." }, 400);
  }
  if (name.length > 80) {
    return reply({ ok: false, message: "Nama terlalu panjang." }, 400);
  }

  if (
    input.phone !== undefined &&
    input.phone !== null &&
    typeof input.phone !== "string"
  ) {
    return reply({ ok: false, message: "Nomor HP belum benar." }, 400);
  }

  const rawPhone = typeof input.phone === "string" ? input.phone.trim() : "";
  const phone = rawPhone ? normalizePhone(rawPhone) : "";
  if (phone && (phone.length > 20 || !isValidPhone(phone))) {
    return reply(
      { ok: false, message: "Nomor HP pakai format +62 atau 08." },
      400,
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return reply(
      { ok: false, message: "Layanan auth belum dikonfigurasi." },
      500,
    );
  }

  const now = Date.now();
  prune(now);

  const ip = clientIp(request);
  const ipRetry = retryAfter(ipBuckets, ip, IP_LIMIT, now);
  if (ipRetry > 0) {
    return reply(
      {
        ok: false,
        message: "Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi.",
      },
      429,
      ipRetry,
    );
  }

  const emailRetry = retryAfter(emailBuckets, email, EMAIL_LIMIT, now);
  if (emailRetry > 0) {
    return reply(
      {
        ok: false,
        message: "Terlalu banyak permintaan kode untuk email ini. Coba lagi nanti.",
      },
      429,
      emailRetry,
    );
  }

  const sentAt = lastSentAt.get(email);
  if (sentAt && now - sentAt < COOLDOWN_MS) {
    const wait = Math.ceil((COOLDOWN_MS - (now - sentAt)) / 1000);
    return reply(
      { ok: false, message: `Tunggu ${wait} detik sebelum minta kode lagi.` },
      429,
      wait,
    );
  }

  consume(ipBuckets, ip, now);
  consume(emailBuckets, email, now);
  lastSentAt.set(email, now);

  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  try {
    const metadata =
      mode === "register"
        ? { name, ...(phone ? { phone } : {}) }
        : undefined;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: mode === "register",
        ...(metadata ? { data: metadata } : {}),
      },
    });

    if (error) {
      lastSentAt.delete(email);
      release(emailBuckets, email, now);

      const upstreamStatus = error.status ?? 0;
      const status =
        upstreamStatus === 429 ? 429 : upstreamStatus >= 500 ? 502 : 400;
      return reply({ ok: false, message: authErrorMessage(error) }, status);
    }

    return reply({ ok: true });
  } catch {
    lastSentAt.delete(email);
    release(emailBuckets, email, now);
    return reply(
      { ok: false, message: "Koneksi ke server gagal. Coba lagi ya." },
      502,
    );
  }
}
