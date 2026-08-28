/** Make-only reference (no Figma frame). */
import { View, Text, Pressable, Linking } from "react-native";
import { Home, MapPin, Info } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";

function mapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default function StayTab({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textSecondary, marginBottom: 20 }}>
        Accommodation options across all budgets in {d.name}.
      </Text>

      <View style={{ gap: 16 }}>
        {d.accommodation.map((acc) => (
          <View
            key={acc.type}
            style={{ backgroundColor: c.surface, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 16 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Home color={c.teal} size={16} />
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary }}>{acc.type}</Text>
              </View>
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.primary }}>{acc.priceRange}</Text>
            </View>
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: c.textSecondary, marginBottom: 12 }}>
              {acc.description}
            </Text>

            {acc.venues && acc.venues.length > 0 ? (
              <>
                <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: c.textPrimary, marginBottom: 8 }}>
                  Recommended — tap for directions:
                </Text>
                <View style={{ gap: 8 }}>
                  {acc.venues.map((venue) => (
                    <Pressable
                      key={venue.name}
                      onPress={() => Linking.openURL(mapsUrl(venue.mapsQuery))}
                      style={{
                        flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surfaceAlt,
                        borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12,
                      }}
                    >
                      <MapPin color={c.primary} size={14} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, color: c.textPrimary }}>{venue.name}</Text>
                        {venue.location && (
                          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{venue.location}</Text>
                        )}
                      </View>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <>
                <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: c.textPrimary, marginBottom: 6 }}>
                  Recommended:
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  {acc.examples.map((ex) => (
                    <View key={ex} style={{ backgroundColor: c.surfaceAlt, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textPrimary }}>{ex}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {acc.sourceNote && (
              <View style={{ flexDirection: "row", gap: 6, marginTop: 12, backgroundColor: withOpacity(c.textMuted, 0.08), borderRadius: 10, padding: 10 }}>
                <Info color={c.textMuted} size={12} style={{ marginTop: 1 }} />
                <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10, lineHeight: 14, color: c.textMuted, flex: 1 }}>
                  {acc.sourceNote}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
