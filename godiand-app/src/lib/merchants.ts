import { supabase } from "./supabase";

export type FoodMerchant = {
  id: string;
  name: string;
  address: string | null;
};

export async function loadFoodMerchants(): Promise<FoodMerchant[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("merchants")
    .select("id, name, address")
    .eq("category", "makanan")
    .eq("is_active", true)
    .order("name")
    .limit(4);

  if (error) {
    throw new Error("Daftar warung belum bisa dimuat.");
  }

  return data ?? [];
}
