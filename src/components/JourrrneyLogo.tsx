/**
 * Ported from the user-supplied brand asset "Logo compass.svg" (a
 * multi-size reference sheet, "journey-compass-*.svg", 25px → 400px) —
 * a simplified compass mark: 8 major ticks, a block "N" at true north,
 * and a tapered two-tone needle (forest green north / rust south)
 * pivoting on a small ringed dot. This supersedes the earlier, more
 * ornate CompassMark.svg port (16 ticks + script "N") from the Make
 * prototype's src/imports/CompassMark.svg.
 */
import { View, Text } from "react-native";
import Svg, { Circle, Line, Polygon, Text as SvgText } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";

const BRAND_GREEN = "#1E4739";
const RING_GREEN = "#2C4A3E";
const NEEDLE_RUST = "#C45A2A";
const DISC_CREAM = "#F5F0E8";

const TICK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

interface CompassMarkProps {
  size?: number;
  /** Subtle needle wobble, like a compass settling on north. Off by
   * default — only the Splash screen turns this on. */
  animated?: boolean;
}

export function CompassMark({ size = 40, animated = false }: CompassMarkProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!animated) return;
    rotation.value = withRepeat(
      withSequence(
        withTiming(6, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(-5, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, [animated, rotation]);

  const needleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const ring = (
    <>
      <Circle cx={50} cy={50} r={45} fill={DISC_CREAM} stroke={RING_GREEN} strokeWidth={3.5} />
      {TICK_ANGLES.map((angle) => (
        <Line
          key={angle}
          x1={50}
          y1={9}
          x2={50}
          y2={16}
          stroke={RING_GREEN}
          strokeWidth={2.4}
          strokeLinecap="round"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
      <SvgText
        x={50}
        y={22}
        fontSize={9}
        fontWeight="700"
        fill={RING_GREEN}
        textAnchor="middle"
        fontFamily="Poppins_700Bold"
      >
        N
      </SvgText>
    </>
  );

  const needle = (
    <>
      <Polygon points="50,20 45,50 55,50" fill={RING_GREEN} />
      <Polygon points="50,80 45,50 55,50" fill={NEEDLE_RUST} />
      <Circle cx={50} cy={50} r={4.5} fill={RING_GREEN} />
      <Circle cx={50} cy={50} r={1.8} fill={DISC_CREAM} />
    </>
  );

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute" }}>
        {ring}
      </Svg>
      {animated ? (
        <Animated.View style={[{ width: size, height: size }, needleStyle]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            {needle}
          </Svg>
        </Animated.View>
      ) : (
        <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute" }}>
          {needle}
        </Svg>
      )}
    </View>
  );
}

interface Props {
  size?: number;
  variant?: "mark" | "lockup";
  wordmarkColor?: string;
  animated?: boolean;
}

export default function JourrrneyLogo({ size = 40, variant = "mark", wordmarkColor = BRAND_GREEN, animated = false }: Props) {
  if (variant === "mark") return <CompassMark size={size} animated={animated} />;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: size * 0.28 }}>
      <CompassMark size={size} animated={animated} />
      <Text
        style={{
          fontFamily: "Poppins_700Bold",
          fontSize: size * 0.52,
          color: wordmarkColor,
          letterSpacing: 0.5,
        }}
      >
        Jourrrney
      </Text>
    </View>
  );
}
