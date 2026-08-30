import { View, Text } from "react-native";
import { Clock, Star } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import type { JourneyGuide } from "@/data/journeyGuides";
import { useThemeColors } from "@/theme/useThemeColors";
import { Card, Callout, rgba } from "./shared";

export default function ExploreSection({ destination: d, guide }: { destination: Destination; guide?: JourneyGuide }) {
  const c = useThemeColors();
  return (
    // gap: 16 — see HurdlesSection's note; kept uniform across all six
    // How to Reach sub-tabs.
    <View style={{ gap: 16 }}>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary }}>
        Local attractions around {d.name} — from must-visits to hidden gems most travelers miss.
      </Text>

      {guide ? (
        guide.localAttractions.map((attr) => (
          <Card key={attr.name} borderColor={attr.mustDo ? rgba(c.primary, 0.3) : c.border}>
            <View style={{ padding: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 2 }}>
                    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>{attr.name}</Text>
                    {attr.mustDo && (
                      <View style={{ backgroundColor: "#333C81", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 9, color: "#FFFFFF" }}>Must Visit</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.teal }}>{attr.type}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.primary }}>{attr.entryFee}</Text>
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{attr.distanceFromCenter}</Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 16, marginBottom: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <Clock color={c.textSecondary} size={12} />
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{attr.timing}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <Star color={c.textSecondary} size={12} />
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{attr.bestTime}</Text>
                </View>
              </View>

              <Callout icon="🔍" text={attr.insiderTip} bg={rgba(c.gold, 0.1)} />
            </View>
          </Card>
        ))
      ) : (
        d.nearbyPlaces.map((place) => (
          <Card key={place.name}>
            <View style={{ padding: 14 }}>
              {/* justifyContent: "space-between" with neither side
                  constrained let a long place name push distance past
                  the card's edge instead of wrapping — same root cause
                  as the hero's rating/duration/season row. */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary, flexShrink: 1 }}>{place.name}</Text>
                <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary, flexShrink: 0 }}>{place.distance}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 6 }}>
                <View style={{ backgroundColor: c.surfaceAlt, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10, color: c.textSecondary }}>{place.type}</Text>
                </View>
                {place.isHidden && (
                  <View style={{ backgroundColor: "#0D5C63", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 10, color: "#FFFFFF" }}>Hidden Gem</Text>
                  </View>
                )}
              </View>
            </View>
          </Card>
        ))
      )}
    </View>
  );
}
