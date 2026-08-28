/** Make-only reference (no Figma frame). */
import { View, Text, ActivityIndicator } from "react-native";
import { Eye, MapPin, Compass } from "lucide-react-native";
import type { Destination, NearbyPlace } from "@/data/destinations";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";
import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";

export default function NearbyTab({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  const popular = d.nearbyPlaces.filter((p) => !p.isHidden);
  const hidden = d.nearbyPlaces.filter((p) => p.isHidden);
  const { loading: osmLoading, error: osmError, places: osmPlaces } = useNearbyPlaces(d.id);
  // Anything already shown in the hand-curated lists above shouldn't be
  // repeated in the "More" section below.
  const curatedNames = new Set([...popular, ...hidden].map((p) => p.name.trim().toLowerCase()));
  const morePlaces = osmPlaces.filter((p) => !curatedNames.has(p.name.trim().toLowerCase()));

  return (
    <View style={{ padding: 20 }}>
      <View
        style={{
          flexDirection: "row", gap: 8, backgroundColor: withOpacity(c.gold, 0.1),
          borderWidth: 1, borderColor: withOpacity(c.gold, 0.25), borderRadius: 12, padding: 12, marginBottom: 20,
        }}
      >
        <Eye color={c.gold} size={16} />
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, lineHeight: 16, color: c.textPrimary, flex: 1 }}>
          <Text style={{ fontFamily: "Poppins_700Bold" }}>Hidden gems</Text> marked below are off-the-beaten-path spots
          fewer than 5% of visitors discover.
        </Text>
      </View>

      {popular.length > 0 && (
        <>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary, marginBottom: 12 }}>
            Popular Nearby Places
          </Text>
          <View style={{ gap: 10, marginBottom: 20 }}>
            {popular.map((place) => (
              <NearbyCard key={place.name} place={place} c={c} />
            ))}
          </View>
        </>
      )}

      {hidden.length > 0 && (
        <>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.gold, marginBottom: 12 }}>
            💎 Unexplored Hidden Gems
          </Text>
          <View style={{ gap: 10, marginBottom: 20 }}>
            {hidden.map((place) => (
              <NearbyCard key={place.name} place={place} isGem c={c} />
            ))}
          </View>
        </>
      )}

      {/* Live long-tail POIs from OpenStreetMap — a supplement to the
          hand-curated lists above, not a replacement. Only rendered once
          there's something to show, so a loading spinner or an error never
          appears as a bare, unexplained empty state below the curated
          content that's already useful on its own. */}
      {osmLoading && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 }}>
          <ActivityIndicator size="small" color={c.textSecondary} />
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary }}>
            Looking for more places nearby…
          </Text>
        </View>
      )}
      {!osmLoading && !osmError && morePlaces.length > 0 && (
        <>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary, marginBottom: 4 }}>
            More Places Nearby
          </Text>
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textMuted, marginBottom: 12 }}>
            Sourced from OpenStreetMap — not individually reviewed by us.
          </Text>
          <View style={{ gap: 10 }}>
            {morePlaces.map((place) => (
              <View
                key={place.id}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 12,
                  backgroundColor: c.surface, borderWidth: 1, borderColor: c.borderSoft, borderRadius: 14, padding: 12,
                }}
              >
                <Compass color={c.textSecondary} size={16} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary }}>{place.name}</Text>
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>
                    {place.category} · {place.distanceKm} km away
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

function NearbyCard({ place, isGem, c }: { place: NearbyPlace; isGem?: boolean; c: ReturnType<typeof useThemeColors> }) {
  return (
    <View
      style={{
        flexDirection: "row", alignItems: "center", gap: 12,
        backgroundColor: isGem ? withOpacity(c.gold, 0.08) : c.surface,
        borderWidth: 1, borderColor: isGem ? withOpacity(c.gold, 0.25) : c.border,
        borderRadius: 14, padding: 12,
      }}
    >
      <MapPin color={isGem ? c.gold : c.primary} size={16} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary }}>{place.name}</Text>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>
          {place.type} · {place.distance}
        </Text>
      </View>
    </View>
  );
}
