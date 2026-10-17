/**
 * Source of truth: Figma "1.2.9 Search — Live Suggestions" and "1.3.1
 * Search & Smart Filters". The two Figma frames are really one screen in
 * two states — typing shows live suggestions, an empty/blurred search bar
 * shows the filterable browse list — so they're built here as a single
 * component that switches between them, rather than two separate routes.
 */
import { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { router } from "expo-router";
import DestinationCard from "@/components/DestinationCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Search, X } from "lucide-react-native";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import { findLiveMatches, resolveUnambiguousMatch, matchNonIndiaPlace } from "@/data/matchDestination";
import { useRecentSearchesStore } from "@/store/useRecentSearchesStore";
import { useThemeColors } from "@/theme/useThemeColors";

const CATEGORIES = ["All", "Heritage", "Beach", "Nature", "Hills"];
// destinations.ts has no "Hills" tag — approximated by known hill-station ids.
const HILL_STATION_IDS = ["ladakh", "munnar", "darjeeling", "coorg", "rishikesh"];
const POPULAR_SEARCHES = ["Udaipur", "Goa", "Munnar", "Ladakh"];
// How many matching places a search shows. The browse list holds only one place per
// state, so a search (by place or by state) has to be able to show more than a few.
const LIVE_RESULTS = 12;

interface Props {
  onSelectDestination: (d: Destination) => void;
  initialQuery?: string;
}

export default function SearchResults({ onSelectDestination, initialQuery }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [focused, setFocused] = useState(false);
  const [category, setCategory] = useState("All");
  const recentSearches = useRecentSearchesStore((s) => s.searches);
  const addSearch = useRecentSearchesStore((s) => s.addSearch);
  const recentIds = useMemo(
    () => recentSearches.map((s) => s.destinationId).filter((id): id is string => !!id),
    [recentSearches],
  );

  const suggestionMode = focused || query.trim().length > 0;

  // Back goes to the screen this was opened from (Home). If this page was opened
  // directly (a reload, a shared link) there is nothing to go back to, so it
  // opens Home instead.
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  // A "completed search" = picking a destination while a query is active
  // (suggestion mode) — browsing the unfiltered list below doesn't count.
  const handleSearchSelect = (d: Destination) => {
    addSearch(query, d.id);
    onSelectDestination(d);
  };

  // A query naming a well-known place outside India (e.g. "dubai") must
  // never surface a coincidental fuzzy match (e.g. "Dubdi Monastery") as a
  // real result for it — see matchNonIndiaPlace's doc comment in
  // matchDestination.ts. Checked once and reused below to both suppress
  // matching and show an explicit message instead of silently falling
  // back to "Popular Searches".
  const nonIndiaPlace = useMemo(() => matchNonIndiaPlace(query), [query]);
  const liveMatches = useMemo(
    () => (nonIndiaPlace ? [] : findLiveMatches(query, LIVE_RESULTS, recentIds)),
    [query, recentIds, nonIndiaPlace],
  );

  // Hitting search/enter on a query that clearly means one destination
  // (an exact name/state match, like "Arunachal Pradesh", or a query with
  // only one live match, like "Arunachal") should go straight to that
  // destination's page — not leave the user to tap it again from a list
  // they've already effectively narrowed to one result. An ambiguous
  // multi-match query is left as a list rather than guessing.
  const handleSubmit = () => {
    if (nonIndiaPlace) return;
    const target = resolveUnambiguousMatch(query);
    if (target) handleSearchSelect(target);
  };

  // The browse list shows one place from each state or territory: the most
  // reviewed one in the chosen category, listed by state name. Every other place
  // is one search away (the live suggestions below show up to LIVE_RESULTS).
  // `hidden` destinations are real, full pages, left out of this browse list (same
  // reasoning as Home's Popular Destinations); search for one by name to reach it.
  const filtered = useMemo(() => {
    const visible = DESTINATIONS.filter((d) => !d.hidden);
    const inCategory =
      category === "All" ? visible
      : category === "Hills" ? visible.filter((d) => HILL_STATION_IDS.includes(d.id))
      : visible.filter((d) => d.category.includes(category));
    const topPerState = new Map<string, Destination>();
    for (const d of inCategory) {
      const best = topPerState.get(d.state);
      if (!best || d.reviews > best.reviews) topPerState.set(d.state, d);
    }
    return [...topPerState.values()].sort((a, b) => a.state.localeCompare(b.state));
  }, [category]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 12 }}>
      <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: suggestionMode ? 16 : 20 }}>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          style={{
            width: 44, height: 44, borderRadius: 22, backgroundColor: c.surfaceAlt,
            borderWidth: 1, borderColor: c.borderSoft, alignItems: "center", justifyContent: "center",
          }}
        >
          <ArrowLeft color={c.textPrimary} size={22} />
        </Pressable>
        <View
          style={{
            flex: 1, flexDirection: "row", alignItems: "center", gap: 10, height: 44, borderRadius: 14, paddingHorizontal: 14,
            backgroundColor: c.surface, borderWidth: 1.5, borderColor: suggestionMode ? c.primary : c.border,
          }}
        >
          <Search color={c.textSecondary} size={16} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            placeholder="Search destinations..."
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
      </View>

      {suggestionMode ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {nonIndiaPlace && (
            <View style={{ backgroundColor: c.surfaceAlt, borderRadius: 14, padding: 14, marginBottom: 20 }}>
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary, lineHeight: 19 }}>
                We're currently focused on destinations within India — happy to help you find a trip anywhere in India though!
              </Text>
            </View>
          )}
          {liveMatches.length > 0 && (
            <View style={{ gap: 10, marginBottom: 20 }}>
              {liveMatches.map((d) => (
                <DestinationCard key={d.id} destination={d} onPress={() => handleSearchSelect(d)} layout="row" compact />
              ))}
            </View>
          )}

          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, letterSpacing: 1, color: c.textSecondary, marginBottom: 12 }}>
            POPULAR SEARCHES
          </Text>
          <View style={{ gap: 8 }}>
            {POPULAR_SEARCHES.map((term) => (
              <Pressable
                key={term}
                onPress={() => setQuery(term)}
                style={{ flexDirection: "row", alignItems: "center", gap: 10, height: 40, paddingHorizontal: 14, borderRadius: 12, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}
              >
                <Search color={c.textSecondary} size={13} />
                <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textPrimary }}>{term}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, marginBottom: 12 }}>
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: active ? "#333C81" : c.surface, borderWidth: 1, borderColor: active ? "#333C81" : c.border }}
                >
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: active ? "#FFFFFF" : c.textSecondary }}>{cat}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary, paddingHorizontal: 20, marginBottom: 14 }}>
            One top place from each of {filtered.length} {filtered.length === 1 ? "state or territory" : "states and territories"}. To find any other place, use the search box.
          </Text>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {filtered.map((d) => (
              <DestinationCard key={d.id} destination={d} onPress={() => onSelectDestination(d)} layout="row" showPrice />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
