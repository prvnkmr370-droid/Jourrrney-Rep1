/** Source of truth: Figma "1.1 Home Feed". */
import { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight } from "lucide-react-native";
import { Image } from "expo-image";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import HeroCarousel from "./HeroCarousel";
import DestinationCard from "@/components/DestinationCard";
import SafeCard from "@/components/SafeCard";
import { withOpacity } from "@/components/withOpacity";
import { useRecentSearchesStore, timeAgo } from "@/store/useRecentSearchesStore";
import { useRecentlyViewedStore } from "@/store/useRecentlyViewedStore";
import { useThemeColors } from "@/theme/useThemeColors";

const CATEGORIES = ["All", "Heritage", "Beach", "Nature", "Adventure"];

// colorKey picks the theme-resolved accent at render time — the raw hex
// literals these used to carry double as text/icon color on a very-light
// tint of themselves, and light-mode's dark accent hexes read as
// near-invisible-on-near-black once that tint sits on a dark background.
const QUICK_ACTIONS = [
  { label: "Plan Trip", emoji: "✨", colorKey: "primary" as const, route: "/(tabs)/plan" as const },
  { label: "Women Safe", emoji: "🛡️", colorKey: "teal" as const, route: "/(tabs)/safety" as const },
  { label: "Explore All", emoji: "🧭", colorKey: "gold" as const, route: "/search/results" as const },
];

function goToDestination(d: Destination) {
  router.push(`/destination/${d.id}`);
}

interface Props {
  /** Height of the floating bottom tab bar — since it's absolutely
   * positioned, React Navigation doesn't reserve space for it, so the
   * scroll content needs its own bottom clearance to match. */
  tabBarHeight?: number;
}

export default function HomeScreen({ tabBarHeight = 0 }: Props) {
  const c = useThemeColors();
  const [activeCategory, setActiveCategory] = useState("All");
  const recentSearches = useRecentSearchesStore((s) => s.searches);
  const recentlyViewedIds = useRecentlyViewedStore((s) => s.destinationIds);
  const recentlyViewed = useMemo(
    () => recentlyViewedIds.map((id) => DESTINATIONS.find((d) => d.id === id)).filter((d): d is Destination => !!d),
    [recentlyViewedIds],
  );

  const featured = useMemo(
    () =>
      activeCategory === "All"
        ? DESTINATIONS
        : DESTINATIONS.filter((d) => d.category.includes(activeCategory)),
    [activeCategory],
  );
  const safest = useMemo(
    () => [...DESTINATIONS].sort((a, b) => b.womenSafety.score - a.womenSafety.score).slice(0, 5),
    [],
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} showsVerticalScrollIndicator={false}>
      <HeroCarousel onDestinationSelect={goToDestination} />

      {/* Category chips — fixed 24px margin above and below, matching the
          spacing used between every other section on this page (Quick
          Actions, Popular Destinations, Plan Trip CTA, etc.) instead of the
          horizontal ScrollView's own vertical padding, so the rhythm down
          the page is uniform rather than starting off at 16px. */}
      <View style={{ marginTop: 24, marginBottom: 24 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={{
                  height: 36, paddingHorizontal: 16, borderRadius: 999,
                  alignItems: "center", justifyContent: "center",
                  backgroundColor: active ? c.primary : c.surface,
                  // Border width stays constant across states (only its color
                  // changes) so the pill's box size — and its vertical
                  // alignment against its neighbors — never shifts on tap.
                  borderWidth: 1.5, borderColor: active ? c.primary : c.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins_700Bold", fontSize: 12, lineHeight: 16,
                    color: active ? "#FFFFFF" : c.textSecondary,
                  }}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Quick actions */}
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 24 }}>
        {QUICK_ACTIONS.map(({ label, emoji, colorKey, route }) => {
          const color = c[colorKey];
          return (
            <Pressable
              key={label}
              onPress={() => router.push(route)}
              style={{
                flex: 1, alignItems: "center", gap: 8, paddingVertical: 16, borderRadius: 16,
                backgroundColor: withOpacity(color, 0.1),
                borderWidth: 1.5, borderColor: withOpacity(color, 0.2),
              }}
            >
              <Text style={{ fontSize: 24 }}>{emoji}</Text>
              <Text style={{ fontFamily: "Poppins_800ExtraBold", fontSize: 11, color }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Section
        title={activeCategory === "All" ? "Popular Destinations" : activeCategory}
        onSeeAll={() => router.push("/search/results")}
      >
        {featured.slice(0, 8).map((d) => (
          <DestinationCard key={d.id} destination={d} onPress={() => goToDestination(d)} />
        ))}
      </Section>

      {/* Plan Trip CTA */}
      <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
        <Pressable onPress={() => router.push("/(tabs)/plan")}>
          <LinearGradient
            colors={["#333C81", "#C44A0A", "#0D5C63"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 20 }}
          >
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: 1, marginBottom: 4 }}>
              AI-POWERED
            </Text>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 20, color: "#FFFFFF", marginBottom: 4 }}>
              Plan your perfect trip
            </Text>
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 14 }}>
              Budget, comfort, or luxury — we build your itinerary.
            </Text>
            <View
              style={{
                alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6,
                backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 999,
                paddingHorizontal: 16, paddingVertical: 8,
              }}
            >
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: "#FFFFFF" }}>Start Planning</Text>
              <ChevronRight color="#FFFFFF" size={16} />
            </View>
          </LinearGradient>
        </Pressable>
      </View>

      <Section title="Safest for Women & Solo Travel" onSeeAll={() => router.push("/(tabs)/safety")} accentColor={c.success}>
        {safest.map((d) => (
          <SafeCard key={d.id} destination={d} onPress={() => goToDestination(d)} />
        ))}
      </Section>

      {recentlyViewed.length > 0 && (
        <Section title="Recently Viewed" onSeeAll={() => router.push("/recently-viewed")}>
          {recentlyViewed.map((d) => (
            <DestinationCard key={d.id} destination={d} onPress={() => goToDestination(d)} />
          ))}
        </Section>
      )}

      {recentSearches.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 16, color: c.textPrimary }}>Recent Searches</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
            {recentSearches.map((s) => {
              const dest = DESTINATIONS.find((d) => d.id === s.destinationId);
              return (
                <Pressable
                  key={s.id}
                  onPress={() => router.push({ pathname: "/search/results", params: { q: s.query } })}
                  style={{ width: 150, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 10 }}
                >
                  {dest ? (
                    <Image source={{ uri: dest.image }} style={{ width: "100%", height: 80, borderRadius: 10, marginBottom: 8 }} contentFit="cover" />
                  ) : (
                    <View style={{ width: "100%", height: 80, borderRadius: 10, marginBottom: 8, backgroundColor: c.surfaceAlt }} />
                  )}
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.textPrimary }} numberOfLines={1}>
                    {s.query}
                  </Text>
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10, color: c.textSecondary, marginTop: 2 }}>
                    {timeAgo(s.timestamp)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={{ height: tabBarHeight + 24 }} />
    </ScrollView>
  );
}

function Section({
  title,
  onSeeAll,
  accentColor,
  children,
}: {
  title: string;
  onSeeAll: () => void;
  accentColor?: string;
  children: React.ReactNode;
}) {
  const c = useThemeColors();
  const accent = accentColor ?? c.primary;
  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 12 }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 16, color: c.textPrimary }}>{title}</Text>
        <Pressable onPress={onSeeAll} style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: accent }}>See all</Text>
          <ChevronRight color={accent} size={14} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {children}
      </ScrollView>
    </View>
  );
}
