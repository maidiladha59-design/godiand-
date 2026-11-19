import type { ViewStyle } from "react-native";

export const colors = {
  brand50: "#eef8ff",
  brand100: "#dceffb",
  brand200: "#b7e0f7",
  brand600: "#0a78b5",
  brand700: "#095f91",
  brand900: "#0d435f",
  ink900: "#0b1c26",
  ink700: "#2a4450",
  ink600: "#4d6672",
  ink500: "#708995",
  mist: "#f1f7fb",
  white: "#ffffff",
  sun50: "#fff8e1",
  sun400: "#fdcb4b",
  mint50: "#e8f8f2",
  mint700: "#077a60",
  coral50: "#ffefe9",
  coral600: "#e4552f",
  coral700: "#b93f20",
  grape50: "#f2edff",
  grape700: "#5438c7",
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const hardShadow: ViewStyle = {
  shadowColor: colors.ink900,
  shadowOffset: { width: 3, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
};
