/** Source of truth: Figma "1.2.1 Destination Detail — Overview". The
 * Trip Prep & Packing teaser below Top Highlights has no Figma frame —
 * Overview previously embedded the full PackingSection inline, which made
 * a "quick skim" tab into a long scroll. Overview now just teases it and
 * links to the same content on the standalone Trip Prep screen (also
 * reachable from the Safety tab), passing this destination explicitly. */
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Sparkles, Backpack, ChevronRight } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";

export default function OverviewTab({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  return (
    <View style={{ padding: 20 }}>
      {/* marginBottom matches the teaser card's marginTop below (24) so the
          gap before and after "Top Highlights" is the same on both sides. */}
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 15, lineHeight: 23, color: c.textSecondary, marginBottom: 24 }}>
        {d.description}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <Sparkles color={c.primary} size={14} />
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary }}>Top Highlights</Text>
      </View>

      <View style={{ gap: 10 }}>
        {d.highlights.map((highlight, i) => (
          <View
            key={highlight}
            style={{
              flexDirection: "row", alignItems: "center", gap: 12,
              backgroundColor: c.surfaceAlt, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14,
            }}
          >
            <View
              style={{
                width: 24, height: 24, borderRadius: 12,
                backgroundColor: "#333C81", alignItems: "center", justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: "#FFFFFF" }}>{i + 1}</Text>
            </View>
            <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 13, color: c.textPrimary, flex: 1 }}>
              {highlight}
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={() => router.push(`/safety/trip-prep?destId=${d.id}`)}
        style={{
          flexDirection: "row", alignItems: "center", gap: 12, marginTop: 24,
          backgroundColor: withOpacity(c.gold, 0.1), borderWidth: 1.5, borderColor: withOpacity(c.gold, 0.35),
          borderRadius: 16, padding: 14,
        }}
      >
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: withOpacity(c.gold, 0.18), alignItems: "center", justifyContent: "center" }}>
          <Backpack color={c.gold} size={18} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>Trip Prep & Packing</Text>
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary, marginTop: 2 }}>
            What to pack for {d.bestSeason} — and more
          </Text>
        </View>
        <ChevronRight color={c.gold} size={16} />
      </Pressable>
    </View>
  );
}
