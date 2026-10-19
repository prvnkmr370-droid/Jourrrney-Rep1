/**
 * "How to get there" on a destination's home page, straight under Places Near:
 * one card per way of reaching the place (flight, train, road, ferry...) with how
 * long it takes, what it costs, where to arrive and a tip, then how to get from
 * there to the main sight. The card text comes from the place's own guide (see
 * utils/howToReach.ts). A button below opens the route planner page, which asks
 * where you are starting from. Sizes follow the redesign's rules: nothing under
 * 12pt, a button of at least 44pt, and text that wraps at 130% instead of being cut.
 */
import { View, Text, Pressable } from "react-native";
import { Car, Compass, MapPin, Plane, Route, Ship, TrainFront } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { getJourneyGuide } from "@/data/journeyGuides";
import { reachModes, sightText, type ReachKind } from "@/utils/howToReach";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";

const MAX_FONT = 1.3;

const ICONS: Record<ReachKind, typeof Plane> = { flight: Plane, train: TrainFront, water: Ship, road: Car, other: Route };

export default function HowToGetThere({ destination: d, onOpenPlanner }: { destination: Destination; onOpenPlanner: () => void }) {
  const c = useThemeColors();
  const guide = getJourneyGuide(d.id);
  const placeName = d.name.replace(/\s*\([^)]*\)/g, "").trim();
  const modes = reachModes(d, guide);
  const sight = sightText(guide);

  return (
    <View style={{ marginTop: 24 }}>
      <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 20, lineHeight: 27, color: c.textPrimary, paddingHorizontal: 20 }}>
        How to get there
      </Text>
      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary, paddingHorizontal: 20, marginTop: 2, marginBottom: 10 }}>
        Ways to reach {placeName}, from our travel guide.
      </Text>

      <View style={{ gap: 10, paddingHorizontal: 16 }}>
        {modes.map((m) => {
          const Icon = ICONS[m.kind];
          return (
            <View key={m.key} style={{ padding: 14, borderRadius: 16, borderWidth: 1, borderColor: c.borderSoft, backgroundColor: c.surfaceAlt }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: withOpacity(c.gold, 0.14), alignItems: "center", justifyContent: "center" }}>
                  <Icon color={c.gold} size={22} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 16, lineHeight: 22, color: c.textPrimary }}>{m.mode}</Text>
                  {m.duration ? (
                    <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 20, color: c.textSecondary }}>{m.duration}</Text>
                  ) : null}
                  {m.cost ? (
                    <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, lineHeight: 20, color: c.gold }}>{m.cost}</Text>
                  ) : null}
                </View>
              </View>

              {m.arrival ? (
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 12 }}>
                  <MapPin color={c.textSecondary} size={16} style={{ marginTop: 3 }} />
                  <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 21, color: c.textPrimary }}>
                    <Text style={{ fontFamily: "Poppins_700Bold" }}>Arrive at: </Text>
                    {m.arrival}
                  </Text>
                </View>
              ) : null}

              {m.tip ? (
                <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 21, color: c.textSecondary, marginTop: m.arrival ? 6 : 12 }}>{m.tip}</Text>
              ) : null}
            </View>
          );
        })}

        {sight ? (
          <View style={{ padding: 14, borderRadius: 16, borderWidth: 1, borderColor: withOpacity(c.teal, 0.3), backgroundColor: withOpacity(c.teal, 0.08) }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Compass color={c.teal} size={18} />
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14.5, lineHeight: 21, color: c.teal }}>From there to the sights</Text>
            </View>
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 22, color: c.textPrimary }}>{sight}</Text>
          </View>
        ) : null}
      </View>

      <Pressable
        onPress={onOpenPlanner}
        accessibilityRole="button"
        accessibilityLabel={`Find my route to ${placeName} from my city`}
        android_ripple={{ color: withOpacity(c.onPrimary, 0.2) }}
        style={{
          marginHorizontal: 16, marginTop: 12, minHeight: 52, borderRadius: 12, backgroundColor: c.primary,
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8,
        }}
      >
        <Route color={c.onPrimary} size={19} />
        <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14.5, lineHeight: 20, color: c.onPrimary }}>Find my route from my city</Text>
      </Pressable>
      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary, paddingHorizontal: 20, marginTop: 6 }}>
        Type your city to see the distance and the best way to come.
      </Text>
    </View>
  );
}
