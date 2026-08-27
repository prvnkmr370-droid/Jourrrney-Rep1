/**
 * Ported from the Make prototype's BookingsTab (labeled "Bookings" there
 * despite showing search history, not real bookings — the app has no
 * booking/payment feature, so "Recent Searches" is the honest label used
 * here and on the tab itself). Now backed by the real useRecentSearchesStore
 * (populated from actual searches in src/screens/Search/SearchResults.tsx)
 * instead of a hardcoded static list.
 */
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Star } from "lucide-react-native";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import { useRecentSearchesStore, timeAgo } from "@/store/useRecentSearchesStore";
import { useRecentlyViewedStore } from "@/store/useRecentlyViewedStore";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";

export default function SearchesTab() {
  const c = useThemeColors();
  const { searches, clearAll } = useRecentSearchesStore();
  const recentlyViewedIds = useRecentlyViewedStore((s) => s.destinationIds);
  const recentlyViewed = recentlyViewedIds
    .map((id) => DESTINATIONS.find((d) => d.id === id))
    .filter((d): d is Destination => !!d);

  return (
    // gap: 16 matches the block-to-block rhythm used by the sibling
    // Profile and Settings tabs on this same screen, so switching between
    // the three My Account tabs doesn't change the page's vertical rhythm.
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>
      <View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary }}>Recent Searches</Text>
        {searches.length > 0 && (
          <Pressable onPress={clearAll}>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.primary }}>Clear all</Text>
          </Pressable>
        )}
      </View>

      {searches.length === 0 ? (
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textSecondary, textAlign: "center", paddingVertical: 20 }}>
          No recent searches yet — try searching for a destination.
        </Text>
      ) : (
        <View style={{ gap: 10 }}>
          {searches.map((s) => {
            const dest = DESTINATIONS.find((d) => d.id === s.destinationId);
            return (
              <View key={s.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 14 }}>
                {dest ? (
                  <Image source={{ uri: dest.image }} style={{ width: 40, height: 40, borderRadius: 12 }} contentFit="cover" />
                ) : (
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.surfaceAlt }} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>{s.query}</Text>
                  {dest && (
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary, marginTop: 2 }}>
                      {dest.category[0]} · {dest.state}
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: "flex-end", gap: 6 }}>
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10, color: c.textMuted }}>{timeAgo(s.timestamp)}</Text>
                  <Pressable
                    onPress={() => router.push({ pathname: "/search/results", params: { q: s.query } })}
                    style={{ backgroundColor: withOpacity(c.primary, 0.1), borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}
                  >
                    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.primary }}>Search again</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}
      </View>

      {recentlyViewed.length > 0 && (
        <View>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary, marginBottom: 14 }}>
            Recently Viewed
          </Text>
          <View style={{ gap: 10 }}>
            {recentlyViewed.map((d) => (
              <Pressable
                key={d.id}
                onPress={() => router.push(`/destination/${d.id}`)}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 14 }}
              >
                <Image source={{ uri: d.image }} style={{ width: 40, height: 40, borderRadius: 12 }} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>{d.name}</Text>
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary, marginTop: 2 }}>{d.state}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                  <Star color="#FBBF24" fill="#FBBF24" size={12} />
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.textPrimary }}>{d.rating}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
