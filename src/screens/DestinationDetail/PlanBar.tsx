/**
 * The "Plan my trip with AI" bar pinned to the bottom of every destination
 * page (the home page and each page it opens). It goes straight to the AI
 * planner with this place already chosen: there is no page in between.
 */
import { Pressable, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";

export default function PlanBar({ placeName, onPress }: { placeName: string; onPress: () => void }) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  return (
    <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), backgroundColor: withOpacity(c.bg, 0.97), borderTopWidth: 1, borderTopColor: c.borderSoft }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Plan my trip to ${placeName} with AI`}
        style={{
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
          backgroundColor: "#333C81", borderRadius: 16, minHeight: 52,
        }}
      >
        <Sparkles color="#FFFFFF" size={16} />
        <Text
          style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: "#FFFFFF", flexShrink: 1 }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          Plan my trip with AI
        </Text>
      </Pressable>
    </View>
  );
}
