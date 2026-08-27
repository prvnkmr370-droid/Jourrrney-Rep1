/**
 * Make-only reference (no Figma frame). Ported from the prototype's
 * "How to Reach" tab, which is itself a 6-section sub-flow (Getting
 * There / What to Pack / Traveler Hurdles / City Essentials / Local
 * Spots / Travel Advisory) backed by src/data/journeyGuides.ts.
 * Only 11 of the 16 destinations have a journey guide — the rest fall
 * back to the plainer transport/localTransport/nearbyPlaces data, same
 * as the Make prototype does.
 */
import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { getJourneyGuide } from "@/data/journeyGuides";
import type { Destination } from "@/data/destinations";
import { useThemeColors } from "@/theme/useThemeColors";

import ArriveSection from "./how-to-reach/ArriveSection";
import WeatherSection from "./how-to-reach/WeatherSection";
import HurdlesSection from "./how-to-reach/HurdlesSection";
import EssentialsSection from "./how-to-reach/EssentialsSection";
import ExploreSection from "./how-to-reach/ExploreSection";
import AdvisorySection from "./how-to-reach/AdvisorySection";

const SECTIONS = [
  { id: "arrive", label: "Getting There", icon: "✈️" },
  { id: "weather", label: "What to Pack", icon: "🧳" },
  { id: "hurdles", label: "Traveler Hurdles", icon: "⚡" },
  { id: "essentials", label: "City Essentials", icon: "🏙️" },
  { id: "explore", label: "Local Spots", icon: "📍" },
] as const;

type Section = (typeof SECTIONS)[number]["id"] | "advisory";

export default function HowToReachTab({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  const guide = getJourneyGuide(d.id);
  const [section, setSection] = useState<Section>("arrive");

  const visibleSections = guide?.travelAdvisory
    ? [...SECTIONS, { id: "advisory" as const, label: "Travel Advisory", icon: "🛡️" }]
    : SECTIONS;

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingTop: 16, paddingBottom: 8 }}>
        {visibleSections.map((sec) => {
          const active = section === sec.id;
          return (
            <Pressable
              key={sec.id}
              onPress={() => setSection(sec.id)}
              style={{
                flexDirection: "row", alignItems: "center", gap: 6,
                paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
                backgroundColor: active ? "#333C81" : c.surfaceAlt,
              }}
            >
              <Text style={{ fontSize: 12 }}>{sec.icon}</Text>
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: active ? "#FFFFFF" : c.textSecondary }}>
                {sec.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ padding: 20 }}>
        {section === "arrive" && <ArriveSection destination={d} guide={guide} />}
        {section === "weather" && <WeatherSection destination={d} guide={guide} />}
        {section === "hurdles" && <HurdlesSection destination={d} guide={guide} />}
        {section === "essentials" && <EssentialsSection destination={d} guide={guide} />}
        {section === "explore" && <ExploreSection destination={d} guide={guide} />}
        {section === "advisory" && guide?.travelAdvisory && (
          <AdvisorySection advisory={guide.travelAdvisory} destName={d.name} />
        )}
      </View>
    </View>
  );
}
