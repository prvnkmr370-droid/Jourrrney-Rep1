/**
 * Ported from the Make prototype's App.tsx inline bottom-nav JSX — the
 * frosted pill with the active tab "bubbling up" into a filled circle.
 * No Figma frame covers the nav bar itself, so this file IS the reference.
 */
import { View, Text, Pressable } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Compass, Sparkles, Shield, type LucideIcon } from "lucide-react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";

const ICONS: Record<string, LucideIcon> = {
  index: Compass,
  plan: Sparkles,
  safety: Shield,
};
const LABELS: Record<string, string> = {
  index: "Discover",
  plan: "Plan Trip",
  safety: "Safety",
};

export default function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();

  return (
    <View
      pointerEvents="box-none"
      className="absolute left-0 right-0 items-center"
      style={{ bottom: 0, paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <View
        className="flex-row items-center"
        style={{
          width: "88%",
          maxWidth: 390,
          backgroundColor: withOpacity(c.surface, 0.97),
          borderRadius: 40,
          paddingHorizontal: 6,
          paddingTop: 10,
          paddingBottom: 8,
          borderWidth: 1,
          borderColor: c.border,
          shadowColor: "#000",
          shadowOpacity: 0.16,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        }}
      >
        {state.routes.map((route: (typeof state.routes)[number], index: number) => {
          const isActive = state.index === index;
          const Icon = ICONS[route.name] ?? Compass;
          const label = LABELS[route.name] ?? route.name;

          return (
            <TabButton
              key={route.key}
              Icon={Icon}
              label={label}
              isActive={isActive}
              c={c}
              onPress={() => {
                const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!isActive && !event.defaultPrevented) navigation.navigate(route.name);
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabButton({
  Icon,
  label,
  isActive,
  onPress,
  c,
}: {
  Icon: LucideIcon;
  label: string;
  isActive: boolean;
  onPress: () => void;
  c: ReturnType<typeof useThemeColors>;
}) {
  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isActive ? 1 : 0.001, { damping: 14, stiffness: 180 }) }],
    opacity: withSpring(isActive ? 1 : 0),
  }));

  // The active bubble keeps a fixed indigo fill with white icon — that
  // pairing already holds 4.5:1+ contrast regardless of theme, so it's
  // not swapped. The inactive icon/label opacity-based gray needed a
  // separate dark-mode value since 32%-opacity near-black is invisible
  // against a near-black tab bar.
  const inactiveColor = c.textMuted;

  return (
    <Pressable onPress={onPress} className="flex-1 items-center justify-end" style={{ height: 44 }}>
      {isActive ? (
        <>
          <Animated.View
            style={[
              bubbleStyle,
              {
                position: "absolute",
                top: -26,
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: "#333C81",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: c.surface,
                shadowColor: "#333C81",
                shadowOpacity: 0.45,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 6,
              },
            ]}
          >
            <Icon color="#FFFFFF" size={20} strokeWidth={2.2} />
          </Animated.View>
          <Text style={{ fontFamily: "Poppins_800ExtraBold", fontSize: 9.5, color: c.primary, letterSpacing: 0.2 }}>
            {label}
          </Text>
        </>
      ) : (
        <>
          <Icon color={inactiveColor} size={18} strokeWidth={1.7} style={{ marginBottom: 2 }} />
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 9.5, color: inactiveColor, letterSpacing: 0.2 }}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
