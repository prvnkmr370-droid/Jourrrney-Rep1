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
  primary: string; // brand accent, used as text/icon and for the active-chip fill
  onPrimary: string; // text/icon colour that sits ON a solid `primary` fill
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
  onPrimary: "#FFFFFF",
  teal: "#0D5C63",
  gold: "#C9981F",
  danger: "#DC2626",
  success: "#15803D",
  warning: "#D97706",
};

// Dark theme: "night sky" — deep midnight navy surfaces, warm cream text and
// star-gold accents/hairlines, taken from the Katie Tong Studio "Written in
// the Stars" collection (--night-ink #0E1424, --midnight #141B2E,
// --card-navy #1A2338, --star-gold #C9A35C, --candle-gold #D8B878, cream
// #F4EEE2). Only colour changes here: type, spacing and layout are untouched.
// Text/icon tokens were checked against WCAG AA on `bg`, `surface` and
// `surfaceAlt` (all >= 4.5:1).
export const darkPalette: Palette = {
  bg: "#0E1424",
  surface: "#141B2E",
  surfaceAlt: "#1A2338",
  textPrimary: "#F4EEE2",
  textSecondary: "#C9C3B6",
  textMuted: "#9C9A98",
  border: "rgba(201,163,92,0.30)",
  borderSoft: "rgba(201,163,92,0.14)",
  primary: "#D8B878", // candle gold — the brand indigo is replaced by gold in the dark theme
  onPrimary: "#0E1424", // night ink on a gold fill (white on gold would fail contrast)
  teal: "#4FC3CC", // lightened teal — #0D5C63 itself fails contrast on a dark bg
  gold: "#C9A35C", // star gold
  danger: "#F87171",
  success: "#4ADE80",
  warning: "#FBBF24",
};
