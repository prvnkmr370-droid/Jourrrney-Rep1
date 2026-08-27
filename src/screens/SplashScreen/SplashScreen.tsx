/**
 * Source of truth: Figma "0.0 Splash Screen" for the layout ("Jourrrney"
 * wordmark, tagline, gradient background). The compass mark itself is
 * ported from the Make prototype's CompassMark.svg brand asset — see
 * src/components/JourrrneyLogo.tsx.
 * Animation timing (enter → hold → exit → onComplete) ported from the
 * Figma Make prototype's src/screens/SplashScreen.tsx, which has no Figma
 * equivalent to reference for behavior.
 */
import { useEffect } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CompassMark } from "@/components/JourrrneyLogo";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";

interface Props {
  onComplete: () => void;
}

const ENTER_MS = 200;
const HOLD_UNTIL_MS = 2600;
const EXIT_MS = 600;

export default function SplashScreen({ onComplete }: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.96);

  useEffect(() => {
    // enter
    opacity.value = withDelay(ENTER_MS, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));
    scale.value = withDelay(ENTER_MS, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));

    // exit, then hand off to onComplete
    const exitTimer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: EXIT_MS }, (finished) => {
        if (finished) runOnJS(onComplete)();
      });
      scale.value = withTiming(1.05, { duration: EXIT_MS });
    }, HOLD_UNTIL_MS);

    return () => clearTimeout(exitTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="absolute inset-0 z-50">
      <LinearGradient
        colors={["#0d1117", "#0D5C63", "#1a0a02"]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        className="absolute inset-0"
      />
      <Animated.View style={animatedStyle} className="flex-1 items-center justify-center">
        <View className="mb-6">
          <CompassMark size={80} animated />
        </View>
        <Text
          style={{ fontFamily: "Poppins_600SemiBold", fontSize: 34, color: "#FFFFFF" }}
        >
          Jourrrney
        </Text>
        <Text
          style={{
            fontFamily: "Poppins_600SemiBold",
            fontSize: 11,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: 4,
            marginTop: 10,
          }}
        >
          ROUTE · ROAM · REPEAT
        </Text>
      </Animated.View>
    </View>
  );
}
