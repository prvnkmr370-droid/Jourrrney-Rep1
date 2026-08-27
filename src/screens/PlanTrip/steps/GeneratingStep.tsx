/** Source of truth: Figma "2.1.1 AI Generating — Skeleton Loading". */
import { useEffect } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles } from "lucide-react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, Easing } from "react-native-reanimated";
import { useThemeColors } from "@/theme/useThemeColors";
import { styleAccent } from "../styleAccent";
import type { StyleConfig } from "../data";

export default function GeneratingStep({ styleConfig }: { styleConfig: StyleConfig }) {
  const c = useThemeColors();
  const accent = styleAccent(c, styleConfig.id);
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", paddingTop: 100, paddingHorizontal: 20 }}>
      <View style={{ width: 100, height: 100, marginBottom: 20, alignSelf: "flex-start", marginLeft: 20 }}>
        <PulseCircle size={100} color={c.surfaceAlt} delay={0} />
      </View>
      <View style={{ width: 60, height: 60, marginBottom: 40, alignSelf: "flex-start", marginLeft: 20, marginTop: -60 }}>
        <PulseCircle size={60} color={accent} gradient delay={300} />
      </View>

      <Sparkles color={accent} size={28} style={{ marginBottom: 20 }} />

      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 19, color: c.textPrimary, textAlign: "center", marginBottom: 12 }}>
        Building your {styleConfig.label} plan…
      </Text>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary, textAlign: "center", marginBottom: 30 }}>
        Matching {styleConfig.transport.toLowerCase()}, {styleConfig.stay.toLowerCase()}, and {styleConfig.local.toLowerCase()} options for your trip.
      </Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <Dot color={accent} delay={0} />
        <Dot color={accent} delay={150} />
        <Dot color={accent} delay={300} />
      </View>
    </View>
  );
}

function PulseCircle({ size, color, gradient, delay }: { size: number; color: string; gradient?: boolean; delay: number }) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, overflow: "hidden" }, style]}>
      {gradient ? (
        <LinearGradient colors={[color, "#0D5C63"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
      ) : (
        <View style={{ flex: 1, backgroundColor: color }} />
      )}
    </Animated.View>
  );
}

function Dot({ color, delay }: { color: string; delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(withTiming(1, { duration: 600, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }, style]} />;
}
