/**
 * No Figma frame — the Home Feed's "Recently Viewed" section's "See all"
 * previously routed to the generic Search results screen, which shows
 * every destination rather than just the ones the user actually viewed.
 * This is a dedicated full list containing only real recently-viewed
 * destinations (from useRecentlyViewedStore), nothing else.
 */
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Star } from "lucide-react-native";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import { useRecentlyViewedStore } from "@/store/useRecentlyViewedStore";
import { useThemeColors } from "@/theme/useThemeColors";

export default function RecentlyViewedScreen() {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const recentIds = useRecentlyViewedStore((s) => s.destinationIds);
  const destinations = recentIds
    .map((id) => DESTINATIONS.find((d) => d.id === id))
    .filter((d): d is Destination => !!d);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft color={c.textPrimary} size={18} />
        </Pressable>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 18, color: c.textPrimary }}>Recently Viewed</Text>
      </View>

      {destinations.length === 0 ? (
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textSecondary, textAlign: "center", paddingVertical: 20 }}>
          You haven't viewed any destinations yet.
        </Text>
      ) : (
        <View style={{ gap: 10 }}>
          {destinations.map((d) => (
            <Pressable
              key={d.id}
              onPress={() => router.push(`/destination/${d.id}`)}
              style={{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 12 }}
            >
              <Image source={{ uri: d.image }} style={{ width: 64, height: 64, borderRadius: 14 }} contentFit="cover" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary }}>{d.name}</Text>
                <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary, marginBottom: 4 }}>{d.state}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Star color="#FBBF24" fill="#FBBF24" size={12} />
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.textPrimary }}>{d.rating}</Text>
                  <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, color: c.primary, marginLeft: 6 }}>
                    ₹{d.budgetBreakdown[0]?.perDayPerPerson.toLocaleString("en-IN")}+/day
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
