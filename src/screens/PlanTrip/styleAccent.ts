import type { Palette } from "@/theme/palette";
import type { TravelStyle } from "./data";

/**
 * STYLE_CONFIGS.color in data.ts is a light-mode-only hex (data.ts is
 * deliberately theme-agnostic pure data/logic). Both FormStep and
 * GeneratingStep need the theme-resolved equivalent instead, so its
 * "active"/pulse tint and text both flip correctly in dark mode rather
 * than data.ts's static color reading as near-invisible on a dark
 * background. Shared here so the two screens stay in sync.
 */
export function styleAccent(c: Palette, id: TravelStyle): string {
  if (id === "backpacker") return c.success;
  if (id === "premium") return c.teal;
  return c.primary;
}
