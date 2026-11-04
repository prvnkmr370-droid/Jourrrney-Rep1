/**
 * The Comfort Index mark: three rings around a dot (the "ripple" in the Comfort Index design files).
 * It stands in for the shield wherever the shield meant "safety". One colour, a 24 x 24 box, and it
 * takes the same `color` and `size` as the lucide icons, so it drops into any place that takes an icon.
 */
import type { ComponentType } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle } from "react-native-svg";

/** What an icon needs to be: a component that takes a colour and a size (lucide icons and this one both are). */
export type IconComponent = ComponentType<{ color?: string; size?: number; strokeWidth?: number; style?: StyleProp<ViewStyle> }>;

export function ComfortIcon({ color = "#000000", size = 24, strokeWidth = 2, style }: { color?: string; size?: number; strokeWidth?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle cx={12} cy={12} r={1.5} fill={color} />
      <Circle cx={12} cy={12} r={5} stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={strokeWidth} fill="none" />
    </Svg>
  );
}
