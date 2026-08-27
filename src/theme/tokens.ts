/**
 * Design tokens ported 1:1 from the Figma Make prototype's src/index.css :root
 * block. Keep this file as the single source of truth — tailwind.config.js
 * reads from it, and any component that needs a raw hex value (SVG fills,
 * gradients, native shadow colors) should import from here rather than
 * hardcoding.
 */
export const colors = {
  background: "#FBF7F2",
  foreground: "#1C1917",
  card: "#FFFFFF",
  cardForeground: "#1C1917",
  primary: "#333C81",
  primaryForeground: "#FFFFFF",
  secondary: "#F0EBE3",
  secondaryForeground: "#1C1917",
  muted: "#F5F0EA",
  mutedForeground: "#78716C",
  accent: "#0D5C63",
  accentForeground: "#FFFFFF",
  gold: "#C9981F",
  goldLight: "#FFF8E8",
  safeGreen: "#15803D",
  warnAmber: "#D97706",
  dangerRed: "#DC2626",
  border: "rgba(28,25,23,0.1)",
  ring: "#333C81",
} as const;

export const radius = {
  sm: 12, // var(--radius) - 4px, radius base = 16
  md: 14, // var(--radius) - 2px
  lg: 16, // var(--radius)
  xl: 24, // var(--radius) + 8px
  full: 999,
} as const;

export const fontFamily = {
  display: "Poppins_600SemiBold",
  body: "Poppins_400Regular",
  bodyMedium: "Poppins_500Medium",
  bodySemiBold: "Poppins_600SemiBold",
  bodyBold: "Poppins_700Bold",
  bodyExtraBold: "Poppins_800ExtraBold",
} as const;

export type ColorToken = keyof typeof colors;
