import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";

export type LocationStatus =
  | "idle"
  | "locating"
  | "granted"
  | "denied"
  | "error";

export type LocatedPoint = {
  latitude: number;
  longitude: number;
  address: string | null;
};

async function describe(
  coords: Pick<LocatedPoint, "latitude" | "longitude">,
): Promise<string | null> {
  try {
    const [geo] = await Location.reverseGeocodeAsync(coords);
    if (!geo) return null;

    const parts = [geo.name, geo.street, geo.district, geo.city].filter(
      (part): part is string => Boolean(part && part.trim()),
    );

    return Array.from(new Set(parts)).join(", ") || null;
  } catch {
    return null;
  }
}

export function useCurrentLocation() {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [point, setPoint] = useState<LocatedPoint | null>(null);
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const locate = useCallback(
    async (requestPermission: boolean): Promise<LocatedPoint | null> => {
      setBusy(true);
      setStatus("locating");

      try {
        let permission = await Location.getForegroundPermissionsAsync();

        if (!permission.granted && requestPermission && permission.canAskAgain) {
          permission = await Location.requestForegroundPermissionsAsync();
        }

        if (!permission.granted) {
          if (mounted.current) setStatus("denied");
          return null;
        }

        const position =
          (await Location.getLastKnownPositionAsync()) ??
          (await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }));

        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        const address = await describe(coords);
        const next: LocatedPoint = { ...coords, address };

        if (mounted.current) {
          setPoint(next);
          setStatus("granted");
        }

        return next;
      } catch {
        if (mounted.current) setStatus("error");
        return null;
      } finally {
        if (mounted.current) setBusy(false);
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;

    Location.getForegroundPermissionsAsync()
      .then((permission) => {
        if (active && permission.granted) {
          void locate(false);
        }
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [locate]);

  return {
    status,
    point,
    busy,
    request: () => locate(true),
    refresh: () => locate(false),
  };
}
