/**
 * Source of truth: Figma "1.2.9 Search — Live Suggestions" and "1.3.1
 * Search & Smart Filters". The two Figma frames are really one screen in
 * two states — typing shows live suggestions, an empty/blurred search bar
 * shows the filterable browse list — so they're built here as a single
 * component that switches between them, rather than two separate routes.
 */
import { useMemo, useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, X, Settings2, Star } from "lucide-react-native";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import { useRecentSearchesStore } from "@/store/useRecentSearchesStore";
import { useThemeColors } from "@/theme/useThemeColors";

const CATEGORIES = ["All", "Heritage", "Beach", "Nature", "Hills"];
// destinations.ts has no "Hills" tag — approximated by known hill-station ids.
const HILL_STATION_IDS = ["ladakh", "munnar", "darjeeling", "coorg", "rishikesh"];
const POPULAR_SEARCHES = ["Udaipur", "Goa", "Munnar", "Ladakh"];

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
  const addSearch = useRecentSearchesStore((s) => s.addSearch);

  const suggestionMode = focused || query.trim().length > 0;

  // A "completed search" = picking a destination while a query is active
  // (suggestion mode) — browsing the unfiltered list below doesn't count.
  const handleSearchSelect = (d: Destination) => {
    addSearch(query, d.id);
    onSelectDestination(d);
  };

  const liveMatches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return DESTINATIONS.filter((d) => d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q)).slice(0, 4);
  }, [query]);

  const filtered = useMemo(() => {
    if (category === "All") return DESTINATIONS;
    if (category === "Hills") return DESTINATIONS.filter((d) => HILL_STATION_IDS.includes(d.id));
    return DESTINATIONS.filter((d) => d.category.includes(category));
  }, [category]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 12 }}>
      <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: suggestionMode ? 16 : 20 }}>
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
        {!suggestionMode && (
          <Pressable style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "#333C81", alignItems: "center", justifyContent: "center" }}>
            <Settings2 color="#FFFFFF" size={18} />
          </Pressable>
        )}
      </View>

      {suggestionMode ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {liveMatches.length > 0 && (
            <View style={{ gap: 10, marginBottom: 20 }}>
              {liveMatches.map((d) => (
                <Pressable
                  key={d.id}
                  onPress={() => handleSearchSelect(d)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 10 }}
                >
                  <Image source={{ uri: d.image }} style={{ width: 48, height: 48, borderRadius: 12 }} contentFit="cover" />
                  <View>
                    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary }}>{d.name}</Text>
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{d.state} · {d.category[0]}</Text>
                  </View>
                </Pressable>
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
            {filtered.length} destination{filtered.length === 1 ? "" : "s"} found
          </Text>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {filtered.map((d) => (
              <Pressable
                key={d.id}
                onPress={() => onSelectDestination(d)}
                style={{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 12 }}
              >
                <Image source={{ uri: d.image }} style={{ width: 64, height: 64, borderRadius: 14 }} contentFit="cover" />
                <View>
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
          </ScrollView>
        </View>
      )}
    </View>
  );
}
