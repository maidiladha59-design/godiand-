import type { ChatMessageRow } from "../database.types";
import { supabase } from "../supabase";
import { databaseError } from "./errors";

export type ChatMessage = Pick<
  ChatMessageRow,
  "id" | "sender_id" | "sender_role" | "message" | "created_at"
>;

export async function loadMessages(
  orderId: string,
): Promise<{ messages: ChatMessage[]; error: string | null }> {
  if (!supabase) {
    return { messages: [], error: "Supabase belum diatur." };
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, sender_id, sender_role, message, created_at")
    .eq("order_id", orderId)
    .order("created_at")
    .limit(200);

  if (error) {
    return {
      messages: [],
      error: "Pesan belum bisa dimuat. Coba lagi ya.",
    };
  }

  return { messages: data ?? [], error: null };
}

export async function sendMessage(input: {
  orderId: string;
  senderId: string;
  message: string;
}): Promise<{ error: string | null }> {
  if (!supabase) {
    return { error: "Supabase belum diatur." };
  }

  const message = input.message.trim();

  if (!message) {
    return { error: "Pesan belum diisi." };
  }

  if (message.length > 2000) {
    return { error: "Pesan terlalu panjang (maksimal 2000 karakter)." };
  }

  const { error } = await supabase.from("chat_messages").insert({
    order_id: input.orderId,
    sender_id: input.senderId,
    sender_role: "customer",
    message,
  });

  return {
    error: error
      ? databaseError(error, "Pesan belum terkirim. Coba lagi.")
      : null,
  };
}
