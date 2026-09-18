/** Source of truth: Figma "3.1 Safety Search Home". */
import { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import DestImage from "@/components/DestImage";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Shield, ChevronRight, Search, X } from "lucide-react-native";
import { DESTINATIONS, getSafetyColor, type Destination } from "@/data/destinations";
import { findLiveMatches } from "@/data/matchDestination";
import { withOpacity } from "@/components/withOpacity";
import { useResolvedScheme, useThemeColors } from "@/theme/useThemeColors";

interface Props {
  onSelectDestination: (d: Destination) => void;
  onTravelSafeSteps: () => void;
  onTripPrep: () => void;
  tabBarHeight?: number;
}

export default function SafetySearchHome({ onSelectDestination, onTravelSafeSteps, onTripPrep, tabBarHeight = 0 }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const isDark = useResolvedScheme() === "dark";

  const [query, setQuery] = useState("");

  // Rendering all 1150+ destinations at once (in a plain ScrollView, with
  // no virtualization) was the actual cause of the slow load — not the
  // per-card content. Default view now shows just one representative per
  // state/UT (the highest-reviewed non-hidden destination in that state),
  // which keeps the list short while still surfacing every region. Typing
  // a query searches the full dataset via the same fuzzy matcher used by
  // the main Search screen, so any of the 1150+ destinations is still
  // reachable — just not all mounted up front.
  const defaultRated = useMemo(() => {
    const bestPerState = new Map<string, Destination>();
    for (const d of DESTINATIONS) {
      if (d.hidden) continue;
      const current = bestPerState.get(d.state);
      if (!current || d.reviews > current.reviews) bestPerState.set(d.state, d);
    }
    return [...bestPerState.values()].sort((a, b) => b.womenSafety.score - a.womenSafety.score);
  }, []);

  const searchRated = useMemo(() => {
    if (!query.trim()) return [];
    return findLiveMatches(query, 20).sort((a, b) => b.womenSafety.score - a.womenSafety.score);
  }, [query]);

  const rated = query.trim() ? searchRated : defaultRated;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <LinearGradient colors={["#0D5C63", "#1A8A94"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: insets.top + 20, paddingBottom: 24, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Shield color="#FFFFFF" size={22} />
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 22, color: "#FFFFFF" }}>Travel Safety</Text>
        </View>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 14 }}>
          Travel India with confidence & assurance
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <StatPill label="23 Safe States" />
          <StatPill label="24/7 Helplines" />
          <StatPill label="8 Solo Tips" />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 + tabBarHeight }} showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={onTravelSafeSteps}
          style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: withOpacity(c.teal, 0.08), borderWidth: 1.5, borderColor: withOpacity(c.teal, 0.35), borderRadius: 16, padding: 14 }}
        >
          <Text style={{ fontSize: 24 }}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.teal }}>Travel Safe — 5 Steps</Text>
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>Habits that go a long way, solo or not</Text>
          </View>
          <ChevronRight color={c.teal} size={16} />
        </Pressable>

        <Pressable
          onPress={onTripPrep}
          style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: withOpacity(c.gold, 0.08), borderWidth: 1.5, borderColor: withOpacity(c.gold, 0.35), borderRadius: 16, padding: 14 }}
        >
          <Text style={{ fontSize: 24 }}>🎒</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.gold }}>Trip Prep & Packing</Text>
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>What to carry, by season</Text>
          </View>
          <ChevronRight color={c.gold} size={16} />
        </Pressable>

        <View>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary, marginBottom: 12 }}>Safety Ratings by Destination</Text>

          <View
            style={{
              flexDirection: "row", alignItems: "center", gap: 12, height: 52, borderRadius: 18, paddingHorizontal: 16, marginBottom: 14,
              backgroundColor: c.surface, borderWidth: 1.5, borderColor: query ? c.primary : c.border,
            }}
          >
            <Search color={c.textSecondary} size={16} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search any destination..."
              placeholderTextColor={c.textMuted}
              style={{
                flex: 1, fontFamily: "Poppins_400Regular", fontSize: 14, color: c.textPrimary,
                paddingVertical: 0, textAlignVertical: "center", includeFontPadding: false,
              }}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <X color={c.textSecondary} size={16} />
              </Pressable>
            )}
          </View>

          {query.trim().length > 0 && rated.length === 0 && (
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textSecondary, marginBottom: 10 }}>
              No destinations match "{query.trim()}".
            </Text>
          )}

          <View style={{ gap: 10 }}>
            {rated.map((d) => {
              const scoreColor = getSafetyColor(d.womenSafety.score, isDark);
              return (
                <Pressable
                  key={d.id}
                  onPress={() => onSelectDestination(d)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 12 }}
                >
                  <DestImage source={{ uri: d.image }} style={{ width: 56, height: 64, borderRadius: 12 }} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary }}>{d.name}</Text>
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary, marginBottom: 6 }}>{d.state}</Text>
                    <View style={{ flexDirection: "row", gap: 2 }}>
                      {Array.from({ length: 10 }).map((_, i) => (
                        <View
                          key={i}
                          style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i < d.womenSafety.score ? c.success : c.surfaceAlt }}
                        />
                      ))}
                    </View>
                  </View>
                  <View style={{ alignItems: "center", backgroundColor: withOpacity(scoreColor, 0.15), borderRadius: 12, paddingVertical: 6, paddingHorizontal: 10 }}>
                    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: scoreColor }}>{d.womenSafety.score}</Text>
                    <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 9, color: scoreColor }}>{d.womenSafety.level === "Very Safe" ? "Excellent" : d.womenSafety.level}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatPill({ label }: { label: string }) {
  return (
    <View style={{ backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
      <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 10, color: "#FFFFFF" }}>{label}</Text>
    </View>
  );
}
