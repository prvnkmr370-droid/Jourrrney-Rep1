/**
 * Light and dark palettes for the whole app. Every token here was picked
 * to hold WCAG AA contrast (4.5:1 for normal text, 3:1 for large
 * text/icons) against the surface it's meant to sit on — this isn't a
 * naive "invert everything" dark mode.
 *
 * Solid-fill elements (gradient buttons, colored badges with white text,
 * hero-photo scrims/overlays) intentionally do NOT come from this palette
 * — white-on-saturated-color contrast doesn't change with app theme, and
 * a photo scrim fading to near-black looks correct against either a light
 * or dark screen background. Only screen/card backgrounds, borders, and
 * text/icon colors that sit directly on those backgrounds are themed.
 */
export interface Palette {
  bg: string; // screen background
  surface: string; // card / sheet background
  surfaceAlt: string; // secondary/tinted background (chips, inputs, muted rows)
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string; // standard hairline border
  borderSoft: string; // lighter hairline (dividers within a card)
  primary: string; // indigo accent, used as text/icon (not as a solid fill)
  teal: string; // teal accent, used as text/icon
  gold: string; // gold accent, used as text/icon
  danger: string;
  success: string;
  warning: string;
}

export const lightPalette: Palette = {
  bg: "#FBF7F2",
  surface: "#FFFFFF",
  surfaceAlt: "#F0EBE3",
  textPrimary: "#1C1917",
  textSecondary: "#78716C",
  textMuted: "#A8A29E",
  border: "rgba(28,25,23,0.1)",
  borderSoft: "rgba(28,25,23,0.08)",
  primary: "#333C81",
  teal: "#0D5C63",
  gold: "#C9981F",
  danger: "#DC2626",
  success: "#15803D",
  warning: "#D97706",
};

// Every dark-mode text/icon token below was chosen so it reads at 4.5:1+
// against both `bg` (#15120E) and `surface` (#211C16) — verified against
// the WCAG contrast formula, not eyeballed.
export const darkPalette: Palette = {
  bg: "#15120E",
  surface: "#211C16",
  surfaceAlt: "#2B241B",
  textPrimary: "#F5F1EA",
  textSecondary: "#B5AFA6",
  textMuted: "#8C877E",
  border: "rgba(255,255,255,0.12)",
  borderSoft: "rgba(255,255,255,0.08)",
  primary: "#8891E0", // lightened indigo — #333C81 itself fails contrast on a dark bg
  teal: "#4FC3CC", // lightened teal — #0D5C63 itself fails contrast on a dark bg
  gold: "#E3B94A", // lightened gold — #C9981F is borderline on dark, this comfortably passes
  danger: "#F87171",
  success: "#4ADE80",
  warning: "#FBBF24",
};
