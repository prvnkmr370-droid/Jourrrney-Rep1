/**
 * A themed wrapper around expo-image's <Image>, used everywhere a
 * destination photo is rendered (search results, home feed, destination
 * detail, safety hub, recently viewed, etc).
 *
 * Some of our real, sourced image URLs — the Haryana Tourism government
 * site in particular — are genuinely slow under concurrent load: a
 * single request is fast, but a scrolling list that fires off a dozen+
 * thumbnail requests at once can see multi-second load times per image
 * (measured: ~5.8s average, some over 7s, under 30-concurrent load,
 * versus well under 1s for a single request). Without a placeholder, a
 * photo that's still loading looks identical to one that's missing.
 *
 * This gives every destination photo a neutral, theme-matched
 * placeholder tint while it loads and a soft fade-in once it resolves,
 * so "still loading" reads as loading rather than broken — and leans on
 * expo-image's own disk cache (on by default) so a photo only pays that
 * slow-load cost once per device, not every time it scrolls back into
 * view.
 */
import { Image, type ImageProps } from "expo-image";
import { useThemeColors } from "@/theme/useThemeColors";

export default function DestImage({ style, ...rest }: ImageProps) {
  const c = useThemeColors();
  return (
    <Image
      transition={300}
      cachePolicy="disk"
      style={[{ backgroundColor: c.surfaceAlt }, style]}
      {...rest}
    />
  );
}
