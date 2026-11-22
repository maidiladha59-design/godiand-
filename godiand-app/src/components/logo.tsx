import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

const outline = "#0B2536";
const logoSource = require("../../assets/logo.png");

type LogoProps = {
  size?: number;
  variant?: "lingkaran" | "dengan-nama";
};

export function Logo({ size = 44, variant = "lingkaran" }: LogoProps) {
  const border = Math.max(2, Math.round(size * 0.06));
  const shadow = Math.max(1, Math.round(size * 0.06));
  const inner = size - border * 2;
  const imageSize = Math.ceil(inner * 1.08);
  const withName = variant === "dengan-nama";

  return (
    <View style={withName ? styles.withName : styles.circle}>
      <View style={{ width: size + shadow, height: size + shadow }}>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: shadow,
            left: shadow,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: outline,
          }}
        />
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: border,
            borderColor: outline,
            backgroundColor: colors.white,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            accessibilityIgnoresInvertColors
            accessibilityLabel={withName ? undefined : "Logo GoDiand"}
            accessible={!withName}
            resizeMode="cover"
            source={logoSource}
            style={{ width: imageSize, height: imageSize }}
          />
        </View>
      </View>
      {withName ? (
        <Text style={[styles.name, { fontSize: Math.round(size * 0.34) }]}>
          GoDiand
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "flex-start",
  },
  withName: {
    alignItems: "center",
    gap: 6,
  },
  name: {
    color: colors.ink900,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginTop: 2,
  },
});
