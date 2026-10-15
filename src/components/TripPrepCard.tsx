/**
 * "Trip Prep & Packing" teaser — links to the standalone Trip Prep screen for
 * a destination. Shown at the end of the How to Reach tab's Travel Advisory
 * section (it used to sit in Overview, between Top Highlights and the nearby
 * places).
 */
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Backpack, ChevronRight } from "lucide-react-native";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";
import type { Destination } from "@/data/destinations";

export default function TripPrepCard({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  return (
    <Pressable
      onPress={() => router.push(`/safety/trip-prep?destId=${d.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Trip prep and packing for ${d.name}`}
      style={{
        flexDirection: "row", alignItems: "center", gap: 12,
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
  );
}
