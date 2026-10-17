/** "Places Near <place>" on a destination's home page: directly under the About
 * block, always visible (never folded by "Show less"). (The description and the
 * Top highlights sit just above, in AboutIntro.tsx; the opening hours are the status card
 * under the photo, so there is no separate Opening hours card here any more.)
 * Originally the About tab; source of truth Figma "1.2.1 Destination Detail —
 * Overview". The
 * Trip Prep & Packing teaser below Top Highlights has no Figma frame —
 * Overview previously embedded the full PackingSection inline, which made
 * a "quick skim" tab into a long scroll. Overview now just teases it and
 * links to the same content on the standalone Trip Prep screen (also
 * reachable from the Safety tab), passing this destination explicitly.
 *
 * The former standalone "Nearby" tab was folded in here (below) rather
 * than kept as its own top-level tab — its content (the popular/hidden
 * split, the live OpenStreetMap list) is genuinely part of "what's around
 * this destination," which Overview already teased with a shorter
 * preview, so the two were merged into one full section instead of
 * keeping a separate tab for what was effectively a longer version of
 * the same thing. */
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import DestImage from "@/components/DestImage";
import { ChevronRight, MapPin, Compass, Gem } from "lucide-react-native";
import { DESTINATIONS, type Destination, type NearbyPlace } from "@/data/destinations";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";
import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";

// A nearby place that links to a destination of its own (place.id) can show
// that destination's photo — the same verified image — instead of a pin icon.
// Places with neither their own image nor a linked destination keep the pin.
const DESTINATION_IMAGE_BY_ID = new Map(DESTINATIONS.map((d) => [d.id, d.image]));

export default function OverviewTab({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  const popularNearby = d.nearbyPlaces.filter((p) => !p.isHidden);
  const hiddenNearby = d.nearbyPlaces.filter((p) => p.isHidden);
  const { loading: osmLoading, error: osmError, places: osmPlaces } = useNearbyPlaces(d.id);
  // Anything already shown in the hand-curated lists above shouldn't be
  // repeated in the "More" section below.
  const curatedNames = new Set(d.nearbyPlaces.map((p) => p.name.trim().toLowerCase()));
  const moreNearby = osmPlaces.filter((p) => !curatedNames.has(p.name.trim().toLowerCase()));
  return (
    // No bottom padding: the rows that follow bring their own top margin.
    <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
      {/* Places near this destination — merged in from the former
          standalone "Nearby" tab (see file header comment). Visual style
          loosely inspired by TripAdvisor's "Things to Do" attraction
          cards (photo + name + a short tag), rebuilt from scratch for
          this app's own look, not copied. A place without a verified real
          photo falls back to a plain icon card instead of a
          fabricated/mismatched image. Only places with a real full
          Destination page of their own (place.id) are tappable — see
          NearbyPlace.id in destinations.ts. */}
      {d.nearbyPlaces.length > 0 && (
        <>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, marginBottom: 12 }}>
            <MapPin color={c.primary} size={14} />
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary }}>Places Near {d.name}</Text>
          </View>

          {popularNearby.length > 0 && (
            <View style={{ gap: 12, marginBottom: hiddenNearby.length > 0 ? 20 : 0 }}>
              {popularNearby.map((place) => (
                <NearbyPlaceCard key={place.name} place={place} c={c} />
              ))}
            </View>
          )}

          {hiddenNearby.length > 0 && (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <Gem color={c.gold} size={15} />
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.gold }}>
                  Unexplored Hidden Gems
                </Text>
              </View>
              <View style={{ gap: 12 }}>
                {hiddenNearby.map((place) => (
                  <NearbyPlaceCard key={place.name} place={place} c={c} isGem />
                ))}
              </View>
            </>
          )}

          {/* Live long-tail POIs from OpenStreetMap — a supplement to the
              hand-curated lists above, not a replacement. Only rendered
              once there's something to show, so a loading spinner or an
              error never appears as a bare, unexplained empty state below
              the curated content that's already useful on its own. */}
          {osmLoading && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, marginTop: 12 }}>
              <ActivityIndicator size="small" color={c.textSecondary} />
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary }}>
                Looking for more places nearby…
              </Text>
            </View>
          )}
          {!osmLoading && !osmError && moreNearby.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary, marginBottom: 4 }}>
                More Places Nearby
              </Text>
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textMuted, marginBottom: 12 }}>
                Sourced from OpenStreetMap — not individually reviewed by us.
              </Text>
              <View style={{ gap: 10 }}>
                {moreNearby.map((place) => (
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
            </View>
          )}
        </>
      )}
    </View>
  );
}

function NearbyPlaceCard({ place, isGem, c }: { place: NearbyPlace; isGem?: boolean; c: ReturnType<typeof useThemeColors> }) {
  const CardWrapper = place.id ? Pressable : View;
  const imageUri = place.image || (place.id ? DESTINATION_IMAGE_BY_ID.get(place.id) : undefined) || undefined;
  return (
    <CardWrapper
      {...(place.id ? { onPress: () => router.push(`/destination/${place.id}`) } : {})}
      style={{
        flexDirection: "row", alignItems: "center", gap: 12,
        backgroundColor: isGem ? withOpacity(c.gold, 0.08) : c.surface,
        borderWidth: 1, borderColor: isGem ? withOpacity(c.gold, 0.25) : c.border,
        borderRadius: 16, padding: 10,
      }}
    >
      {imageUri ? (
        <DestImage source={{ uri: imageUri }} style={{ width: 72, height: 72, borderRadius: 12 }} contentFit="cover" />
      ) : (
        <View style={{ width: 72, height: 72, borderRadius: 12, backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center" }}>
          <MapPin color={isGem ? c.gold : c.textMuted} size={22} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary }} numberOfLines={2}>
          {place.name}
        </Text>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary, marginTop: 2 }} numberOfLines={1}>
          {place.type} · {place.distance}
        </Text>
      </View>
      {place.id && <ChevronRight color={c.textMuted} size={16} />}
    </CardWrapper>
  );
}
