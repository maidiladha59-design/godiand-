import type {
  MenuItemRow,
  MerchantCategory,
  MerchantRow,
} from "../database.types";
import { supabase } from "../supabase";

export type Merchant = Pick<
  MerchantRow,
  "id" | "name" | "description" | "address" | "latitude" | "longitude" | "category"
>;

export type MenuItem = Pick<
  MenuItemRow,
  "id" | "name" | "description" | "price" | "category"
>;

export type MerchantsResult = {
  merchants: Merchant[];
  error: string | null;
};

export type MenuItemsResult = {
  items: MenuItem[];
  error: string | null;
};

export async function loadMerchants(
  category: MerchantCategory,
): Promise<MerchantsResult> {
  if (!supabase) {
    return { merchants: [], error: "Supabase belum diatur." };
  }

  const { data, error } = await supabase
    .from("merchants")
    .select("id, name, description, address, latitude, longitude, category")
    .eq("category", category)
    .eq("is_active", true)
    .eq("is_verified", true)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("name");

  if (error) {
    return {
      merchants: [],
      error: "Daftar toko belum bisa dimuat. Coba lagi ya.",
    };
  }

  return { merchants: data ?? [], error: null };
}

export async function loadMenuItems(
  merchantId: string,
): Promise<MenuItemsResult> {
  if (!supabase) {
    return { items: [], error: "Supabase belum diatur." };
  }

  const { data, error } = await supabase
    .from("menu_items")
    .select("id, name, description, price, category")
    .eq("merchant_id", merchantId)
    .eq("is_available", true)
    .order("name");

  if (error) {
    return { items: [], error: "Menu toko belum bisa dimuat. Coba lagi ya." };
  }

  return { items: data ?? [], error: null };
}

export function merchantLabel(merchant: Merchant): string {
  return merchant.address
    ? `${merchant.name} · ${merchant.address}`
    : merchant.name;
}
