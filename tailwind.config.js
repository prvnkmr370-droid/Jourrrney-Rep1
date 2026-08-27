/**
 * NOTE: this file is loaded directly by Node (no TS transpile step), so the
 * color/radius values are duplicated here as plain JS rather than imported
 * from src/theme/tokens.ts. Keep the two in sync — tokens.ts is still the
 * source of truth for anything read from JS/TSX app code (SVG fills,
 * gradients, shadow colors, etc).
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#FBF7F2",
        foreground: "#1C1917",
        card: "#FFFFFF",
        "card-foreground": "#1C1917",
        primary: "#333C81",
        "primary-foreground": "#FFFFFF",
        secondary: "#F0EBE3",
        "secondary-foreground": "#1C1917",
        muted: "#F5F0EA",
        "muted-foreground": "#78716C",
        accent: "#0D5C63",
        "accent-foreground": "#FFFFFF",
        gold: "#C9981F",
        "gold-light": "#FFF8E8",
        "safe-green": "#15803D",
        "warn-amber": "#D97706",
        "danger-red": "#DC2626",
        border: "rgba(28,25,23,0.1)",
        ring: "#333C81",
      },
      borderRadius: {
        sm: 12,
        md: 14,
        lg: 16,
        xl: 24,
      },
      fontFamily: {
        display: ["Poppins_600SemiBold"],
        body: ["Poppins_400Regular"],
      },
    },
  },
  plugins: [],
};
