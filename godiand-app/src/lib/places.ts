import { supabase } from "./supabase";

export type Place = {
  id: string | null;
  name: string;
  slug: string;
  address: string | null;
  latitude: number;
  longitude: number;
};

export type PickedPlace = {
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
};

type PlaceRow = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  latitude: number | string;
  longitude: number | string;
};

export const cityCenter = { latitude: 5.5483, longitude: 95.3238 };

export const popularPlaces: Place[] = [
  {
    id: null,
    name: "Masjid Raya Baiturrahman",
    slug: "masjid-raya-baiturrahman",
    address: "Jl. Teuku Umar, Banda Aceh",
    latitude: 5.553631,
    longitude: 95.317193,
  },
  {
    id: null,
    name: "Museum Tsunami",
    slug: "museum-tsunami-aceh",
    address: "Jl. Sultan Iskandar Muda, Banda Aceh",
    latitude: 5.54782,
    longitude: 95.315165,
  },
  {
    id: null,
    name: "PLTD Apung",
    slug: "pltd-apung",
    address: "Punge Blang Cut, Jaya Baru, Banda Aceh",
    latitude: 5.546419,
    longitude: 95.30679,
  },
  {
    id: null,
    name: "Pantai Ulee Lheue",
    slug: "pantai-ulee-lheue",
    address: "Ulee Lheue, Meuraxa, Banda Aceh",
    latitude: 5.559854,
    longitude: 95.285432,
  },
];

export async function loadPlaces(): Promise<{
  places: Place[];
  error: string | null;
}> {
  if (!supabase) {
    return { places: popularPlaces, error: null };
  }

  const { data, error } = await supabase
    .from("places")
    .select("id, name, slug, address, latitude, longitude")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return {
      places: popularPlaces,
      error:
        "Daftar tempat belum bisa dimuat. Tujuan populer tetap bisa dipilih.",
    };
  }

  const rows = (data ?? []) as PlaceRow[];
  const places = rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    address: row.address,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
  }));

  return { places: places.length ? places : popularPlaces, error: null };
}
