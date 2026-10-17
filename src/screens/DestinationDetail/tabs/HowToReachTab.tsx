/**
 * The topic cards behind two pages: "How to get there" (From my city, Getting
 * around) and "What to know before I go" (What to pack, City tips, Safety
 * notices, then the Trip Prep link). Ported from the prototype's multi-section
 * sub-flow, backed by src/data/journeyGuides.ts; destinations without a guide
 * fall back to the plainer transport/localTransport data, and "City tips" /
 * "Safety notices" only appear when the guide has that content.
 *
 * Each page's topics are open-and-close cards (one open at a time, the first
 * open to start) instead of a second row of small chips that scrolled
 * sideways and cut labels off. Each card has a plain name and a one-line
 * description, is at least 56pt tall, and tells screen readers whether it is
 * expanded. Opening a card below the fold scrolls its header back into view
 * so the page never jumps away from what was tapped.
 */
import { useRef, useState } from "react";
import { View, Text, Pressable, LayoutAnimation } from "react-native";
import { Plane, BusFront, Luggage, Building2, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react-native";
import { getJourneyGuide } from "@/data/journeyGuides";
import type { Destination } from "@/data/destinations";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";
import TripPrepCard from "@/components/TripPrepCard";

import ArriveSection from "./how-to-reach/ArriveSection";
import WeatherSection from "./how-to-reach/WeatherSection";
import EssentialsSection from "./how-to-reach/EssentialsSection";
import AdvisorySection from "./how-to-reach/AdvisorySection";
import LocalTransportSection from "./how-to-reach/LocalTransportSection";

export type Topic = "arrive" | "localTransport" | "weather" | "essentials" | "advisory";

const TOPICS: { id: Topic; title: string; Icon: typeof Plane; subtitle: (name: string) => string }[] = [
  { id: "arrive", title: "From my city", Icon: Plane, subtitle: (name) => `Flights, trains and road to ${name}` },
  { id: "localTransport", title: "Getting around", Icon: BusFront, subtitle: () => "Autos, taxis, buses and walking" },
  { id: "weather", title: "What to pack", Icon: Luggage, subtitle: () => "Weather and what to bring" },
  { id: "essentials", title: "City tips", Icon: Building2, subtitle: () => "Money, customs and good to know" },
  { id: "advisory", title: "Safety notices", Icon: ShieldAlert, subtitle: () => "Warnings and rules" },
];

interface Props {
  destination: Destination;
  /** Called with the opened card's top, relative to this list, so the page can scroll it into view. */
  onTopicOpen?: (headerY: number) => void;
  /** Which topics this page shows, in order (default: all five). */
  only?: Topic[];
  /** Which card starts open (default: the page's first topic). */
  initialTopic?: Topic;
  /** The Trip Prep & Packing link after the last topic (default: shown). */
  showTripPrep?: boolean;
}

export default function HowToReachTab({ destination: d, onTopicOpen, only, initialTopic, showTripPrep = true }: Props) {
  const c = useThemeColors();
  const guide = getJourneyGuide(d.id);
  const headerY = useRef<Partial<Record<Topic, number>>>({});

  // Every destination has a generated journeyGuides.ts entry, so City tips and
  // Safety notices normally show everywhere. The guards stay in place rather
  // than assuming: without cityEssentials, EssentialsSection would just
  // repeat the "Getting around" list.
  const topics = TOPICS.filter((t) => {
    if (only && !only.includes(t.id)) return false;
    if (t.id === "essentials") return !!guide?.cityEssentials;
    if (t.id === "advisory") return !!guide?.travelAdvisory;
    return true;
  });
  const [open, setOpen] = useState<Topic | null>(initialTopic && topics.some((t) => t.id === initialTopic) ? initialTopic : topics[0]?.id ?? null);
  const cleanName = d.name.replace(/\s*\([^)]*\)/g, "").trim();

  const toggle = (id: Topic) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const next = open === id ? null : id;
    setOpen(next);
    if (next && onTopicOpen) {
      // Wait a beat for the cards above to finish collapsing, then ask the
      // page to bring this card's header back to the top if it fell off.
      setTimeout(() => {
        const y = headerY.current[next];
        if (y != null) onTopicOpen(y);
      }, 80);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {topics.map(({ id, title, Icon, subtitle }) => {
        const isOpen = open === id;
        return (
          <View key={id} onLayout={(e) => { headerY.current[id] = e.nativeEvent.layout.y; }} style={{ marginBottom: 10 }}>
            <Pressable
              onPress={() => toggle(id)}
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              aria-expanded={isOpen}
              accessibilityLabel={`${title}. ${subtitle(cleanName)}. ${isOpen ? "Open, tap to close" : "Closed, tap to open"}`}
              style={{
                minHeight: 56, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 10,
                borderRadius: 14, borderWidth: isOpen ? 1.5 : 1,
                borderColor: isOpen ? c.primary : c.borderSoft,
                backgroundColor: isOpen ? withOpacity(c.primary, 0.12) : c.surfaceAlt,
              }}
            >
              <Icon color={isOpen ? c.primary : c.textSecondary} size={20} />
              <View style={{ flex: 1 }}>
                <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, lineHeight: 20, color: c.textPrimary }}>
                  {title}
                </Text>
                <Text maxFontSizeMultiplier={1.3} numberOfLines={2} style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textSecondary }}>
                  {subtitle(cleanName)}
                </Text>
              </View>
              {isOpen ? <ChevronUp color={c.primary} size={22} /> : <ChevronDown color={c.textSecondary} size={22} />}
            </Pressable>

            {isOpen && (
              <View style={{ paddingTop: 14 }}>
                {id === "arrive" && <ArriveSection destination={d} guide={guide} />}
                {id === "localTransport" && <LocalTransportSection destination={d} />}
                {id === "weather" && <WeatherSection destination={d} guide={guide} />}
                {id === "essentials" && guide?.cityEssentials && <EssentialsSection destination={d} guide={guide} />}
                {id === "advisory" && guide?.travelAdvisory && <AdvisorySection advisory={guide.travelAdvisory} destName={d.name} />}
              </View>
            )}
          </View>
        );
      })}

      {/* Sits after the last topic (Safety notices): packing is the natural next
          step once you've read the warnings. */}
      {showTripPrep && (
        <View style={{ marginTop: 6 }}>
          <TripPrepCard destination={d} />
        </View>
      )}
    </View>
  );
}
