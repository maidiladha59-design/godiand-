import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Metode tidak didukung." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey =
    Deno.env.get("SUPABASE_ANON_KEY") ??
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  const serviceKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("SUPABASE_SECRET_KEY");
  const authHeader = req.headers.get("Authorization") ?? "";

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return json({ error: "Konfigurasi server belum lengkap." }, 500);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();

  if (userError || !userData.user) {
    return json({ error: "Sesi tidak valid. Masuk ulang ya." }, 401);
  }

  const userId = userData.user.id;
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { count, error: activeError } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", userId)
    .in("status", ["mencari_driver", "pending", "accepted", "in_progress"]);

  if (activeError) {
    return json({ error: "Status pesanan belum bisa dicek. Coba lagi." }, 500);
  }

  if (count && count > 0) {
    return json(
      { error: "Masih ada pesanan berjalan. Selesaikan atau batalkan dulu ya." },
      409,
    );
  }

  const { error: ordersError } = await admin
    .from("orders")
    .delete()
    .eq("customer_id", userId);

  if (ordersError) {
    return json({ error: "Riwayat pesanan belum bisa dihapus." }, 500);
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);

  if (deleteError) {
    return json({ error: "Akun belum bisa dihapus. Coba lagi nanti." }, 500);
  }

  return json({ deleted: true });
});
