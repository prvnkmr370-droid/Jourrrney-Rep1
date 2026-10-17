/**
 * "Typical prices" on the Where to stay page: a price ladder. Every stay
 * level is one row with its name and its price, large, so all the prices can
 * be compared at a glance; tapping a row opens its details in place
 * (description, example places). A place with a single stay entry opens by
 * itself, since there is nothing to compare.
 *
 * Built for the real data: only about one place in five has three levels
 * (Budget / Mid-Range / Luxury); most have one entry, 201 have no nightly
 * price, and 484 prices are estimates, which are labelled "Estimate" in words.
 * Only a nightly range gets the large headline; a package price or plain text
 * ("Price varies") is shown smaller, as written.
 * Example names are plain text, not button-shaped chips, because only a few
 * entries carry a map link: those (`venues`) stay tappable. One button below
 * opens Google Maps with hotels near the place.
 */
import { useState } from "react";
import { View, Text, Pressable, Linking, Alert } from "react-native";
import { ChevronDown, ChevronUp, MapPin, Info } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { priceParts } from "@/utils/stayPrice";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";

const MAX_FONT = 1.3;

// A placeholder some entries carry instead of a real example; it isn't a place, so it isn't listed.
const GENERIC_EXAMPLE = "Check accommodation at the nearest major town/city";

function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

async function openMaps(query: string) {
  try {
    await Linking.openURL(mapsSearchUrl(query));
  } catch {
    Alert.alert("Couldn't open maps", "Please check that a maps app or browser is available, then try again.");
  }
}

export default function StayGuide({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  const placeName = d.name.replace(/\s*\([^)]*\)/g, "").trim();
  const single = d.accommodation.length === 1;
  const [open, setOpen] = useState<Record<number, boolean>>({});

  return (
    <View>
      <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 19, lineHeight: 26, color: c.textPrimary, paddingHorizontal: 20, marginTop: 24 }}>
        Typical prices
      </Text>
      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary, paddingHorizontal: 20, marginTop: 2, marginBottom: 10 }}>
        {single ? "From our travel guide." : "From our travel guide. Tap one to see more."}
      </Text>

      <View style={{ marginHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: c.borderSoft, backgroundColor: c.surfaceAlt, overflow: "hidden" }}>
        {d.accommodation.map((acc, i) => {
          const isOpen = single || !!open[i];
          const price = priceParts(acc.priceRange);
          const examples = acc.examples.filter((x) => x.trim() && x.trim() !== GENERIC_EXAMPLE);
          const hasVenues = !!acc.venues && acc.venues.length > 0;

          const head = (
            <>
              <View style={{ flex: 1 }}>
                <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, lineHeight: 21, color: c.textPrimary, marginBottom: 2 }}>
                  {acc.type}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 8, rowGap: 2 }}>
                  <Text
                    maxFontSizeMultiplier={MAX_FONT}
                    style={price.unit
                      ? { fontFamily: "Poppins_700Bold", fontSize: 20, lineHeight: 27, color: c.primary }
                      : price.hasAmount
                        ? { fontFamily: "Poppins_700Bold", fontSize: 15, lineHeight: 21, color: c.primary }
                        : { fontFamily: "Poppins_600SemiBold", fontSize: 15, lineHeight: 21, color: c.textSecondary }}
                  >
                    {price.main}
                  </Text>
                  {price.unit ? (
                    <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary }}>{price.unit}</Text>
                  ) : null}
                  {price.estimate ? (
                    <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 1 }}>
                      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 12, lineHeight: 17, color: c.textSecondary }}>Estimate</Text>
                    </View>
                  ) : null}
                  {price.note ? (
                    <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary }}>{price.note}</Text>
                  ) : null}
                </View>
              </View>
              {single ? null : isOpen ? <ChevronUp color={c.primary} size={22} /> : <ChevronDown color={c.textMuted} size={22} />}
            </>
          );
          const headStyle = { minHeight: 84, flexDirection: "row" as const, alignItems: "center" as const, gap: 12, paddingHorizontal: 14, paddingVertical: 12 };

          return (
            <View key={acc.type} style={{ borderTopWidth: i ? 1 : 0, borderTopColor: c.borderSoft }}>
              {single ? (
                <View style={headStyle}>{head}</View>
              ) : (
                <Pressable
                  onPress={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                  aria-expanded={isOpen}
                  accessibilityLabel={`${acc.type}. ${price.spoken}. ${isOpen ? "Open, tap to close" : "Closed, tap to open"}`}
                  android_ripple={{ color: withOpacity(c.primary, 0.12) }}
                  style={headStyle}
                >
                  {head}
                </Pressable>
              )}

              {isOpen && (
                <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
                  <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 22, color: c.textSecondary }}>
                    {acc.description}
                  </Text>

                  {hasVenues ? (
                    <>
                      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 12, lineHeight: 17, letterSpacing: 0.5, color: c.textMuted, marginTop: 14, marginBottom: 6 }}>
                        RECOMMENDED · TAP FOR DIRECTIONS
                      </Text>
                      <View style={{ gap: 8 }}>
                        {acc.venues!.map((venue) => (
                          <Pressable
                            key={venue.name}
                            onPress={() => openMaps(venue.mapsQuery)}
                            accessibilityRole="button"
                            accessibilityLabel={`${venue.name}${venue.location ? `, ${venue.location}` : ""}. Opens directions in your maps app.`}
                            android_ripple={{ color: withOpacity(c.primary, 0.12) }}
                            style={{
                              minHeight: 48, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surface,
                              borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12,
                            }}
                          >
                            <MapPin color={c.primary} size={16} />
                            <View style={{ flex: 1 }}>
                              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, lineHeight: 20, color: c.textPrimary }}>{venue.name}</Text>
                              {venue.location ? (
                                <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary }}>{venue.location}</Text>
                              ) : null}
                            </View>
                          </Pressable>
                        ))}
                      </View>
                    </>
                  ) : examples.length > 0 ? (
                    <>
                      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 12, lineHeight: 17, letterSpacing: 0.5, color: c.textMuted, marginTop: 14, marginBottom: 4 }}>
                        EXAMPLES
                      </Text>
                      {examples.map((ex) => (
                        <View key={ex} style={{ flexDirection: "row", gap: 9, paddingVertical: 2 }}>
                          <Text style={{ fontSize: 14, lineHeight: 21, color: c.primary }}>•</Text>
                          <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 21, color: c.textPrimary }}>{ex}</Text>
                        </View>
                      ))}
                    </>
                  ) : null}

                  {acc.sourceNote ? (
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 14, backgroundColor: withOpacity(c.textMuted, 0.08), borderRadius: 10, padding: 10 }}>
                      <Info color={c.textMuted} size={14} style={{ marginTop: 2 }} />
                      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textMuted, flex: 1 }}>
                        {acc.sourceNote}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={() => openMaps(`hotels near ${placeName}`)}
        accessibilityRole="button"
        accessibilityLabel={`See stays near ${placeName} on the map. Opens your maps app.`}
        android_ripple={{ color: withOpacity(c.onPrimary, 0.2) }}
        style={{
          marginHorizontal: 16, marginTop: 14, minHeight: 52, borderRadius: 12, backgroundColor: c.primary,
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        <MapPin color={c.onPrimary} size={19} />
        <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14.5, color: c.onPrimary }}>See stays on the map</Text>
      </Pressable>
      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary, paddingHorizontal: 20, marginTop: 6 }}>
        Opens Google Maps with hotels near {placeName}.
      </Text>
    </View>
  );
}
