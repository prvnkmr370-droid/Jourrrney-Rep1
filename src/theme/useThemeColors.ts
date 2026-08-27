import { useColorScheme } from "react-native";
import { useThemeStore } from "@/store/useThemeStore";
import { lightPalette, darkPalette, type Palette } from "./palette";

/**
 * Resolves the app's current color scheme — the Settings "Dark mode"
 * toggle overrides the phone's system setting when set to "light"/"dark";
 * left on "system" (the default), it follows the OS.
 */
export function useResolvedScheme(): "light" | "dark" {
  const mode = useThemeStore((s) => s.mode);
  const system = useColorScheme();
  if (mode === "system") return system === "dark" ? "dark" : "light";
  return mode;
}

/** Returns the current theme's color tokens — see palette.ts for what
 * each one is for and why. Call this at the top of any screen/component
 * that needs theme-aware colors. */
export function useThemeColors(): Palette {
  const scheme = useResolvedScheme();
  return scheme === "dark" ? darkPalette : lightPalette;
}
