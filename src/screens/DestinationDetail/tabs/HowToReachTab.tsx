/**
 * Make-only reference (no Figma frame). Ported from the prototype's
 * "How to Reach" tab, which is itself a multi-section sub-flow (Getting
 * There / Getting Around / What to Pack / City Essentials / Travel
 * Advisory) backed by src/data/journeyGuides.ts. Only 11 destinations
 * have a journey guide — the rest fall back to the plainer
 * transport/localTransport/nearbyPlaces data, same as the Make prototype
 * does. "City Essentials" is hidden entirely for those without a guide
 * (its fallback would just repeat "Getting Around"). The former "Local
 * Spots" sub-section was removed — its content (nearby points of
 * interest) duplicated the "Places Near X" section already on the
 * Overview tab. "Traveler Hurdles" (scam/safety warnings with fixes) was
 * removed from this tab bar too — HurdlesSection.tsx and journeyGuides.ts's
 * cityHurdles data are untouched, just no longer rendered here.
 */
import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Plane, BusFront, Luggage, Building2, ShieldAlert } from "lucide-react-native";
import { getJourneyGuide } from "@/data/journeyGuides";
import type { Destination } from "@/data/destinations";
import { useThemeColors } from "@/theme/useThemeColors";

import ArriveSection from "./how-to-reach/ArriveSection";
import WeatherSection from "./how-to-reach/WeatherSection";
import EssentialsSection from "./how-to-reach/EssentialsSection";
import AdvisorySection from "./how-to-reach/AdvisorySection";
import LocalTransportSection from "./how-to-reach/LocalTransportSection";

const SECTIONS = [
  { id: "arrive", label: "Getting There", Icon: Plane },
  { id: "localTransport", label: "Getting Around", Icon: BusFront },
  { id: "weather", label: "What to Pack", Icon: Luggage },
  { id: "essentials", label: "City Essentials", Icon: Building2 },
] as const;

type Section = (typeof SECTIONS)[number]["id"] | "advisory";

export default function HowToReachTab({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  const guide = getJourneyGuide(d.id);
  const [section, setSection] = useState<Section>("arrive");

  // Every destination now has a generated journeyGuides.ts entry (see
  // scripts/generate-journey-guides.mjs + add-travel-advisory.mjs), so
  // cityEssentials/travelAdvisory are populated everywhere and both tabs
  // show consistently. The guard stays in place rather than assuming —
  // without it, a destination that somehow lacked cityEssentials would
  // fall through to EssentialsSection's fallback, which just repeats the
  // "Getting Around" localTransport list.
  const sections = guide?.cityEssentials ? SECTIONS : SECTIONS.filter((s) => s.id !== "essentials");
  const visibleSections = guide?.travelAdvisory
    ? [...sections, { id: "advisory" as const, label: "Travel Advisory", Icon: ShieldAlert }]
    : sections;

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
              <sec.Icon color={active ? "#FFFFFF" : c.textSecondary} size={13} />
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: active ? "#FFFFFF" : c.textSecondary }}>
                {sec.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ padding: 20 }}>
        {section === "arrive" && <ArriveSection destination={d} guide={guide} />}
        {section === "localTransport" && <LocalTransportSection destination={d} />}
        {section === "weather" && <WeatherSection destination={d} guide={guide} />}
        {section === "essentials" && guide?.cityEssentials && <EssentialsSection destination={d} guide={guide} />}
        {section === "advisory" && guide?.travelAdvisory && (
          <AdvisorySection advisory={guide.travelAdvisory} destName={d.name} />
        )}
      </View>
    </View>
  );
}
