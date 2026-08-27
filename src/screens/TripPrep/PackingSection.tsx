/**
 * Shared packing content — used by the standalone Trip Prep screen,
 * reached both from the Safety tab and from a teaser card on Destination
 * Detail's Overview tab (which links here with ?destId instead of
 * embedding this content inline, to keep Overview a quick skim). Same
 * honesty caveat as before: the season callout and
 * "What to Carry" list are built from real destination data
 * (`bestSeason`, `category`, `packingTips`), not the Figma mockup's
 * hand-authored per-item subtitles/temperature range, which don't exist
 * in the data model.
 *
 * "See packing by place type" used to push to a separate screen
 * (PackingByPlaceType.tsx, now removed) — it's an accordion here instead,
 * so checking Temple/Beach essentials doesn't leave the Trip Prep screen.
 */
import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { CheckCircle, ChevronDown, ChevronUp, Shirt } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";

const ALSO_RECOMMENDED = [
  "Photocopy of ID and hotel booking",
  "Power bank — long days between charges",
  "Small daypack for day trips",
];

type PlaceType = "temple" | "beach";

const PLACE_ITEMS: Record<PlaceType, { title: string; subtitle: string }[]> = {
  temple: [
    { title: "Full-length scarf or dupatta", subtitle: "Covers shoulders and head where required" },
    { title: "Loose, ankle-length bottoms", subtitle: "Shorts and short skirts are turned away" },
    { title: "Slip-on shoes", subtitle: "Footwear comes off before every entrance" },
    { title: "Small coin pouch", subtitle: "For donation boxes and shoe-keepers" },
  ],
  beach: [
    { title: "Reef-safe sunscreen SPF 50+", subtitle: "Coral-friendly formula for coastal waters" },
    { title: "Quick-dry cover-up", subtitle: "For walking between sand and shops" },
    { title: "Waterproof phone pouch", subtitle: "Protects electronics near the shoreline" },
    { title: "Flip-flops or water shoes", subtitle: "Hot sand and sharp shells underfoot" },
  ],
};

const PLACE_LABEL: Record<PlaceType, string> = { temple: "Temple Visit Essentials", beach: "Beach Day Essentials" };

export default function PackingSection({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  const [placeExpanded, setPlaceExpanded] = useState(false);
  const [placeType, setPlaceType] = useState<PlaceType>("temple");
  const placeAccent: Record<PlaceType, string> = { temple: c.primary, beach: c.teal };

  return (
    <View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {d.category.map((cat) => (
          <View key={cat} style={{ backgroundColor: c.surfaceAlt, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.textSecondary }}>{cat}</Text>
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: withOpacity(c.gold, 0.1), borderWidth: 1, borderColor: withOpacity(c.gold, 0.35), borderRadius: 14, padding: 14, marginBottom: 24 }}>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: c.textPrimary }}>
          Best visited <Text style={{ fontFamily: "Poppins_700Bold" }}>{d.bestSeason}</Text> — pack according to the
          season's weather and check the local forecast closer to your trip.
        </Text>
      </View>

      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 17, color: c.textPrimary, marginBottom: 14 }}>What to Carry</Text>
      <View style={{ gap: 10, marginBottom: 24 }}>
        {d.packingTips.map((tip) => (
          <View key={tip} style={{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 14 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: withOpacity(c.primary, 0.12), alignItems: "center", justifyContent: "center" }}>
              <Shirt color={c.primary} size={18} />
            </View>
            <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary, flex: 1 }}>{tip}</Text>
          </View>
        ))}
      </View>

      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 17, color: c.textPrimary, marginBottom: 14 }}>Also Recommended</Text>
      <View style={{ gap: 8, marginBottom: 24 }}>
        {ALSO_RECOMMENDED.map((item) => (
          <View key={item} style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surfaceAlt, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 }}>
            <CheckCircle color={c.success} size={16} />
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textPrimary, flex: 1 }}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, overflow: "hidden" }}>
        <Pressable
          onPress={() => setPlaceExpanded((v) => !v)}
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 }}
        >
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.primary }}>See packing by place type</Text>
          {placeExpanded ? <ChevronUp color={c.primary} size={16} /> : <ChevronDown color={c.primary} size={16} />}
        </Pressable>

        {placeExpanded && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: c.borderSoft, paddingTop: 14 }}>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              {(["temple", "beach"] as PlaceType[]).map((type) => {
                const active = placeType === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => setPlaceType(type)}
                    style={{ paddingHorizontal: 18, paddingVertical: 8, borderRadius: 999, backgroundColor: active ? "#333C81" : c.surfaceAlt, borderWidth: active ? 0 : 1, borderColor: c.border }}
                  >
                    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: active ? "#FFFFFF" : c.textSecondary, textTransform: "capitalize" }}>{type}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: placeAccent[placeType], marginBottom: 10 }}>
              {PLACE_LABEL[placeType]}
            </Text>
            <View style={{ gap: 10 }}>
              {PLACE_ITEMS[placeType].map((item) => (
                <View key={item.title} style={{ backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: withOpacity(placeAccent[placeType], 0.3), borderRadius: 14, padding: 12 }}>
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary, marginBottom: 3 }}>{item.title}</Text>
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary }}>{item.subtitle}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
