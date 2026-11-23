import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { colors, radius, space } from "@/lib/theme";

const TILE = 256;
const ZOOM = 15;

type Tile = { key: string; uri: string; left: number; top: number };

function buildTiles(
  latitude: number,
  longitude: number,
  width: number,
  height: number,
): Tile[] {
  const tilesPerSide = 2 ** ZOOM;
  const worldSize = TILE * tilesPerSide;
  const latRad = (latitude * Math.PI) / 180;

  const worldX = ((longitude + 180) / 360) * worldSize;
  const worldY =
    ((1 -
      Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) /
      2) *
    worldSize;

  const left = worldX - width / 2;
  const top = worldY - height / 2;
  const startX = Math.floor(left / TILE);
  const endX = Math.floor((left + width - 1) / TILE);
  const startY = Math.floor(top / TILE);
  const endY = Math.floor((top + height - 1) / TILE);

  const tiles: Tile[] = [];

  for (let x = startX; x <= endX; x += 1) {
    for (let y = startY; y <= endY; y += 1) {
      if (y < 0 || y >= tilesPerSide) continue;
      const wrappedX = ((x % tilesPerSide) + tilesPerSide) % tilesPerSide;
      tiles.push({
        key: `${ZOOM}/${wrappedX}/${y}`,
        uri: `https://tile.openstreetmap.org/${ZOOM}/${wrappedX}/${y}.png`,
        left: x * TILE - left,
        top: y * TILE - top,
      });
    }
  }

  return tiles;
}

export function OsmMap({
  latitude,
  longitude,
  height = 210,
}: {
  latitude: number;
  longitude: number;
  height?: number;
}) {
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const [failedTiles, setFailedTiles] = useState<Set<string>>(new Set());
  const [retry, setRetry] = useState(0);
  const window = useWindowDimensions();
  // Card lebar maksimal 560, padding layar 16, border kartu 2.
  const fallbackWidth = Math.max(0, Math.min(window.width, 560) - 36);
  const width = measuredWidth > 0 ? measuredWidth : fallbackWidth;

  useEffect(() => {
    setFailedTiles(new Set());
  }, [latitude, longitude, width, height, retry]);

  function handleLayout(event: LayoutChangeEvent) {
    const next = Math.round(event.nativeEvent.layout.width);
    if (next > 0) setMeasuredWidth(next);
  }

  function handleTileError(key: string) {
    setFailedTiles((current) => {
      if (current.has(key)) return current;
      const next = new Set(current);
      next.add(key);
      return next;
    });
  }

  const tiles = width > 0 ? buildTiles(latitude, longitude, width, height) : [];
  const tilesFailed = tiles.length > 0 && failedTiles.size >= tiles.length;

  return (
    <View
      accessibilityLabel="Peta sekitar titik jemput"
      onLayout={handleLayout}
      style={[styles.frame, { height }]}
    >
      {tiles.map((tile) => (
        <Image
          key={`${tile.key}-${retry}`}
          accessibilityIgnoresInvertColors
          onError={() => handleTileError(tile.key)}
          source={{
            uri: tile.uri,
            headers: { "User-Agent": "GoDiand/0.1 (Banda Aceh)" },
          }}
          style={[styles.tile, { left: tile.left, top: tile.top }]}
        />
      ))}

      {tilesFailed ? (
        <View style={styles.fallback}>
          <View style={styles.fallbackIcon}>
            <Ionicons
              color={colors.ink900}
              name="cloud-offline-outline"
              size={24}
            />
          </View>
          <Text style={styles.fallbackTitle}>Peta online belum tampil</Text>
          <Text style={styles.fallbackText}>
            Koneksi lambat atau peta diblokir. Titik tetap tercatat di{" "}
            {latitude.toFixed(5)}, {longitude.toFixed(5)}.
          </Text>
          <View style={styles.fallbackActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setRetry((value) => value + 1)}
              style={({ pressed }) => [
                styles.fallbackButton,
                pressed && styles.fallbackButtonPressed,
              ]}
            >
              <Text style={styles.fallbackButtonText}>Coba lagi</Text>
            </Pressable>
            <Pressable
              accessibilityRole="link"
              onPress={() => {
                Linking.openURL(
                  `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`,
                ).catch(() => {});
              }}
              style={({ pressed }) => [
                styles.fallbackButton,
                styles.fallbackButtonAlt,
                pressed && styles.fallbackButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.fallbackButtonText,
                  styles.fallbackButtonAltText,
                ]}
              >
                Buka peta
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {width > 0 && !tilesFailed ? (
        <View
          pointerEvents="none"
          style={[styles.marker, { left: width / 2 - 14, top: height / 2 - 28 }]}
        >
          <View style={styles.markerDot} />
        </View>
      ) : null}

      {width === 0 ? (
        <Text style={styles.loading}>Menyiapkan peta...</Text>
      ) : null}

      <Pressable
        accessibilityLabel="Informasi lisensi peta OpenStreetMap"
        accessibilityRole="link"
        onPress={() => {
          Linking.openURL("https://www.openstreetmap.org/copyright").catch(
            () => {},
          );
        }}
        style={styles.attribution}
      >
        <Text style={styles.attributionText}>© OpenStreetMap</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: colors.brand100,
  },
  tile: {
    position: "absolute",
    width: TILE,
    height: TILE,
  },
  marker: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: colors.brand600,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.ink900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 4,
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  loading: {
    position: "absolute",
    alignSelf: "center",
    top: "45%",
    color: colors.ink600,
    fontSize: 12,
    fontWeight: "700",
  },
  fallback: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    backgroundColor: colors.brand100,
    paddingHorizontal: space.md,
    paddingBottom: 24,
  },
  fallbackIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.sm,
    backgroundColor: colors.sun400,
    marginBottom: 2,
  },
  fallbackTitle: {
    color: colors.ink900,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  fallbackText: {
    color: colors.ink600,
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
    maxWidth: 300,
  },
  fallbackActions: {
    flexDirection: "row",
    gap: space.sm,
    marginTop: 3,
  },
  fallbackButton: {
    minHeight: 30,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.ink900,
    borderRadius: radius.pill,
    backgroundColor: colors.brand600,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  fallbackButtonAlt: {
    backgroundColor: colors.sun400,
  },
  fallbackButtonPressed: {
    opacity: 0.8,
  },
  fallbackButtonText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "900",
  },
  fallbackButtonAltText: {
    color: colors.ink900,
  },
  attribution: {
    position: "absolute",
    right: 6,
    bottom: 6,
    borderWidth: 1,
    borderColor: colors.ink900,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  attributionText: {
    color: colors.ink700,
    fontSize: 9,
    fontWeight: "700",
  },
});
