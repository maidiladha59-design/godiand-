export type Coordinates = {
  latitude: number;
  longitude: number;
};

const EARTH_RADIUS_KM = 6371;

// Estimasi sementara: jarak lurus dikali faktor jalan biar tarif tidak
// terlalu murah. Nanti ganti perhitungan ini dengan layanan rute
// (mis. OSRM/GraphHopper) supaya jarak mengikuti jalan sebenarnya.
const ROAD_FACTOR = 1.3;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function straightDistanceKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function rideDistanceKm(a: Coordinates, b: Coordinates): number {
  const raw = straightDistanceKm(a, b) * ROAD_FACTOR;
  return Math.max(0.1, Math.round(raw * 10) / 10);
}

export function formatDistanceKm(distanceKm: number): string {
  return `${distanceKm.toFixed(1).replace(".", ",")} km`;
}

export function formatRupiah(value: number): string {
  const grouped = Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp${grouped}`;
}
