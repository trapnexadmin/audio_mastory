import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";
import { useStore } from "./store";
export const design = {
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radius: { sm: 8, md: 12, lg: 20, pill: 100 },
  motion: { fast: 160, normal: 280, slow: 480 },
  blur: { glass: 24, immersive: 70 },
  font: {
    body: "DMSans_400Regular",
    medium: "DMSans_500Medium",
    semibold: "DMSans_600SemiBold",
    bold: "DMSans_700Bold",
    heading: "Manrope_700Bold",
    display: "Manrope_800ExtraBold",
  },
};
export const dark = {
  dark: true,
  bg: "#111213",
  sidebar: "#0c0d0e",
  surface: "#191a1c",
  raised: "#212224",
  text: "#f4f1ed",
  muted: "#909092",
  subtle: "#626367",
  accent: "#edac79",
  accentBg: "#2d241e",
  line: "#262729",
  player: "#19191a",
};
export const light: typeof dark = {
  dark: false,
  bg: "#f4f1eb",
  sidebar: "#eae6df",
  surface: "#ffffff",
  raised: "#e9e5de",
  text: "#242422",
  muted: "#6f6d68",
  subtle: "#89867e",
  accent: "#ac5d2b",
  accentBg: "#efdfcf",
  line: "#dcd7cf",
  player: "#fffcf6",
};
const ThemeContext = createContext(dark);
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useStore((s) => s.theme);
  const system = useColorScheme();
  return (
    <ThemeContext.Provider
      value={
        mode === "light" || (mode === "system" && system === "light")
          ? light
          : dark
      }
    >
      {children}
    </ThemeContext.Provider>
  );
}
export const useTheme = () => useContext(ThemeContext);
