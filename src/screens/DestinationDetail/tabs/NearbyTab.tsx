/** Make-only reference (no Figma frame). */
import { View, Text } from "react-native";
import { Eye, MapPin } from "lucide-react-native";
import type { Destination, NearbyPlace } from "@/data/destinations";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";

export default function NearbyTab({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  const popular = d.nearbyPlaces.filter((p) => !p.isHidden);
  const hidden = d.nearbyPlaces.filter((p) => p.isHidden);

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
          <View style={{ gap: 10 }}>
            {hidden.map((place) => (
              <NearbyCard key={place.name} place={place} isGem c={c} />
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
