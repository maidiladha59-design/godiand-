import type { PlaceRow } from "../database.types";
import { supabase } from "../supabase";

export type Place = Pick<
  PlaceRow,
  "id" | "name" | "address" | "latitude" | "longitude" | "category"
>;

export type PlacesResult = {
  places: Place[];
  error: string | null;
};

export async function loadPlaces(): Promise<PlacesResult> {
  if (!supabase) {
    return { places: [], error: "Supabase belum diatur." };
  }

  const { data, error } = await supabase
    .from("places")
    .select("id, name, address, latitude, longitude, category")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return {
      places: [],
      error: "Titik lokasi belum bisa dimuat. Coba lagi ya.",
    };
  }

  return { places: data ?? [], error: null };
}

export function placeLabel(place: Place): string {
  return place.address ? `${place.name} · ${place.address}` : place.name;
}
