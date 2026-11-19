export type Point = {
  latitude: number;
  longitude: number;
};

const earthRadiusKm = 6371;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function distanceKm(from: Point, to: Point): number {
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(deltaLon / 2) ** 2;

  const distance = 2 * earthRadiusKm * Math.asin(Math.sqrt(a));

  return Math.round(distance * 100) / 100;
}
