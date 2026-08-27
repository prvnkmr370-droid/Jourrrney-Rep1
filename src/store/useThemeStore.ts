import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  /** User's explicit choice from Settings. "system" (the default) means
   * follow the phone's own light/dark setting. */
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: "system",
  setMode: (mode) => set({ mode }),
}));
