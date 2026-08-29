/** Source of truth: Figma "2.1 AI Input Wizard". */
import { useMemo, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, type NativeSyntheticEvent, type NativeScrollEvent, type LayoutChangeEvent } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Sparkles, Navigation, MapPin, Calendar, Map as MapIcon, Search, ChevronDown, ChevronUp, X } from "lucide-react-native";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import { findLiveMatches } from "@/data/matchDestination";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";
import { useOriginStore } from "@/store/useOriginStore";
import { useDetectLocation } from "@/hooks/useDetectLocation";
import { useCitySearch, formatCitySuggestion } from "@/hooks/useCitySearch";
import LocationPickerModal from "@/components/LocationPickerModal";
import { STYLE_CONFIGS, PREFERENCES, type TravelStyle } from "../data";
import { styleAccent } from "../styleAccent";

// Top 6 non-hidden destinations by review count — a popularity proxy, same
// signal used to rank search autocomplete (see matchDestination.ts) — shown
// as a quick-pick row so most people never need the full browse-all grid.
// Computed once from static data rather than per-render.
const POPULAR_DESTINATIONS: Destination[] = [...DESTINATIONS]
  .filter((d) => !d.hidden)
  .sort((a, b) => b.reviews - a.reviews)
  .slice(0, 6);

const VISIBLE_DESTINATIONS = DESTINATIONS.filter((d) => !d.hidden);

// Approximate height of the sticky cost+CTA footer (see the bottom of this
// file) — used only to reserve matching space at the end of the scrolling
// form so its last section never renders underneath the footer.
const FOOTER_HEIGHT = 132;

// This form is one long scroll rather than a paged wizard, so "step" here
// tracks scroll position through the four sections, not separate screens —
// it exists purely to answer "how much is left" while scrolling a dense form.
const SECTIONS = ["Travel Style", "Route", "Dates & Travellers", "Interests"];

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Next 14 days as selectable date chips, for the inline date-strip below —
 * a lighter-weight picker than a full calendar grid, consistent with this
 * form's compact chip-based style everywhere else (categories, interests,
 * travel style). */
function nextDays(count: number): { iso: string; dow: string; dayNum: number; month: string }[] {
  const out = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push({
      iso: d.toISOString().split("T")[0],
      dow: WEEKDAY_SHORT[d.getDay()],
      dayNum: d.getDate(),
      month: MONTH_SHORT[d.getMonth()],
    });
  }
  return out;
}

interface Props {
  onBack?: () => void;
  destination: Destination;
  onSelectDestination: (d: Destination) => void;
  style: TravelStyle;
  onSelectStyle: (s: TravelStyle) => void;
  days: number;
  onDaysChange: (n: number) => void;
  people: number;
  onPeopleChange: (n: number) => void;
  prefs: string[];
  onTogglePref: (id: string) => void;
  /** ISO date (yyyy-mm-dd) or null for "flexible / no specific date". */
  startDate: string | null;
  onStartDateChange: (iso: string | null) => void;
  onGenerate: () => void;
  /** Height of the floating bottom tab bar when this screen is shown as a
   * tab (0 when shown as a modal/stack route with no tab bar) — since the
   * tab bar floats via absolutely positioned, React Navigation doesn't
   * reserve space for it automatically, so any fixed-bottom element here
   * has to account for it manually. */
  tabBarHeight?: number;
}

export default function FormStep({
  onBack, destination, onSelectDestination, style, onSelectStyle,
  days, onDaysChange, people, onPeopleChange, prefs, onTogglePref,
  startDate, onStartDateChange, onGenerate,
  tabBarHeight = 0,
}: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const ctaBottomInset = tabBarHeight > 0 ? tabBarHeight + 12 : Math.max(insets.bottom, 16);
  const sc = STYLE_CONFIGS.find((s) => s.id === style)!;
  const budget = destination.budgetBreakdown.find((b) => b.tier === sc.budgetTier) ?? destination.budgetBreakdown[1];
  const estimatedTotal = budget.perDayPerPerson * days * people;
  const canGenerate = prefs.length > 0;

  const originCity = useOriginStore((s) => s.originCity);
  const setOriginCity = useOriginStore((s) => s.setOriginCity);
  const { locating, detect } = useDetectLocation();
  const [originSearchFocused, setOriginSearchFocused] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const { suggestions: originSuggestions } = useCitySearch(originCity);
  const showOriginSuggestions = originSearchFocused && originSuggestions.length > 0;
  const dateChips = useMemo(() => nextDays(14), []);

  // Destination picker — search-first instead of a full scroll-through-
  // everything grid, same reasoning as Home/Search's own autocomplete.
  // The full grid (VISIBLE_DESTINATIONS) is still there, just collapsed
  // behind "Browse all" for the rare case someone wants to eyeball every
  // option rather than search or pick from the popular row.
  const [destQuery, setDestQuery] = useState("");
  const [destSearchFocused, setDestSearchFocused] = useState(false);
  const [showAllDestinations, setShowAllDestinations] = useState(false);
  const destSuggestions = useMemo(
    () => (destSearchFocused && destQuery.trim() ? findLiveMatches(destQuery, 5) : []),
    [destQuery, destSearchFocused],
  );
  const showDestSuggestions = destSearchFocused && destQuery.trim().length > 0;

  const selectDestination = (d: Destination) => {
    onSelectDestination(d);
    setDestQuery("");
    setDestSearchFocused(false);
  };

  const detectLocation = async () => {
    const city = await detect();
    if (city) setOriginCity(city);
  };

  const [activeSection, setActiveSection] = useState(0);
  const sectionOffsets = useRef<number[]>([0, 0, 0, 0]);

  const handleSectionLayout = (index: number) => (e: LayoutChangeEvent) => {
    sectionOffsets.current[index] = e.nativeEvent.layout.y;
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    let idx = 0;
    for (let i = 0; i < SECTIONS.length; i++) {
      if (y >= sectionOffsets.current[i] - 100) idx = i;
    }
    setActiveSection(idx);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: insets.top + 8, paddingBottom: 8 }}>
        {onBack && (
          <Pressable onPress={onBack} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft color={c.textPrimary} size={18} />
          </Pressable>
        )}
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 18, color: c.textPrimary }}>Plan My Trip</Text>
      </View>

      {/* Progress indicator — tracks scroll position through the four
          sections below so the user always has a "how much is left" cue
          on this long single-scroll form. */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: c.textSecondary, marginBottom: 6 }}>
          Step {activeSection + 1} of {SECTIONS.length} · {SECTIONS[activeSection]}
        </Text>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {SECTIONS.map((label, i) => (
            <View
              key={label}
              style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= activeSection ? "#333C81" : c.surfaceAlt }}
            />
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 8, gap: 24, paddingBottom: 20 + FOOTER_HEIGHT + ctaBottomInset }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={100}
        // Without this, the very first tap on a suggestion row (destination
        // or origin-city search, both below) while its TextInput still has
        // focus just dismisses the keyboard instead of registering the
        // tap — same root cause as the Home search dropdown bug fixed
        // earlier. "handled" lets a touchable that handles the tap fire
        // normally instead.
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary }}>
          Personalised itinerary with budget breakdown
        </Text>

        {/* How do you travel? */}
        <View onLayout={handleSectionLayout(0)}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary, marginBottom: 4 }}>How do you travel?</Text>
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textSecondary, marginBottom: 12 }}>
            Your style shapes transport, accommodation, and local movement.
          </Text>
          <View style={{ gap: 12 }}>
            {STYLE_CONFIGS.map((s) => {
              const active = style === s.id;
              const accent = styleAccent(c, s.id);
              return (
                <Pressable
                  key={s.id}
                  onPress={() => onSelectStyle(s.id)}
                  style={{
                    borderRadius: 16, padding: 16,
                    backgroundColor: active ? withOpacity(accent, 0.1) : c.surface,
                    borderWidth: 1.5, borderColor: active ? accent : c.border,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: active ? accent : c.textPrimary }}>{s.label}</Text>
                    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: accent }}>{s.dailyRange}</Text>
                  </View>
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{s.subtitle}</Text>

                  {active && (
                    <View style={{ marginTop: 10, gap: 4 }}>
                      <StyleRow label="Travel" value={s.transport} color={accent} c={c} />
                      <StyleRow label="Stay" value={s.stay} color={accent} c={c} />
                      <StyleRow label="Local" value={s.local} color={accent} c={c} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Route: origin + destination */}
        <View onLayout={handleSectionLayout(1)}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary, marginBottom: 4 }}>Where from?</Text>
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textSecondary, marginBottom: 12 }}>
            Shared with the rest of the app, so your destination's "How to Reach" details match.
          </Text>
          <View
            style={{
              flexDirection: "row", alignItems: "center", gap: 10, height: 52, borderRadius: 16, paddingHorizontal: 16,
              borderWidth: 1.5, borderColor: c.primary, backgroundColor: c.surface, marginBottom: showOriginSuggestions ? 0 : 24,
            }}
          >
            <MapPin color={c.primary} size={16} />
            <TextInput
              value={originCity}
              onChangeText={setOriginCity}
              onFocus={() => setOriginSearchFocused(true)}
              onBlur={() => setOriginSearchFocused(false)}
              placeholder="Search any city — e.g. Hyderabad"
              placeholderTextColor={c.textMuted}
              style={{ flex: 1, fontFamily: "Poppins_500Medium", fontSize: 14, color: c.textPrimary }}
            />
            <Pressable
              onPress={detectLocation}
              disabled={locating}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center" }}
            >
              {locating ? <ActivityIndicator size="small" color={c.primary} /> : <Navigation color={c.primary} size={14} />}
            </Pressable>
            <Pressable
              onPress={() => setShowMapPicker(true)}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center" }}
            >
              <MapIcon color={c.primary} size={14} />
            </Pressable>
          </View>

          {showOriginSuggestions && (
            <View style={{ backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.border, marginBottom: 24, overflow: "hidden" }}>
              {originSuggestions.map((s, i) => {
                const label = formatCitySuggestion(s);
                return (
                  <Pressable
                    key={s.id}
                    onPressIn={() => {
                      setOriginCity(label);
                      setOriginSearchFocused(false);
                    }}
                    style={{ paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: c.borderSoft }}
                  >
                    <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary }}>{s.name}</Text>
                    {(s.admin1 || s.country) && (
                      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary, marginTop: 1 }}>
                        {[s.admin1, s.country].filter(Boolean).join(", ")}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary, marginBottom: 4 }}>Where to?</Text>

          {/* Currently-selected destination — always visible regardless of
              search state, so it's never ambiguous what "Plan My Trip"
              below is actually planning for. */}
          <View
            style={{
              flexDirection: "row", alignItems: "center", gap: 10,
              backgroundColor: withOpacity(c.primary, 0.08), borderWidth: 1.5, borderColor: c.primary,
              borderRadius: 14, padding: 8, marginTop: 8, marginBottom: 12,
            }}
          >
            <Image source={{ uri: destination.image }} style={{ width: 44, height: 44, borderRadius: 10 }} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>{destination.name}</Text>
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{destination.state}</Text>
            </View>
          </View>

          {/* Search box — same autocomplete engine as Home/Search, so
              typing "agra" or a near-miss like "araku vally" behaves
              identically everywhere in the app. Replaces what used to be a
              full scroll-through-everything grid of 35+ destination tiles,
              the single biggest source of clutter on this form. */}
          <View
            style={{
              flexDirection: "row", alignItems: "center", gap: 10, height: 48, borderRadius: 14, paddingHorizontal: 14,
              borderWidth: 1.5, borderColor: destSearchFocused ? c.primary : c.border, backgroundColor: c.surface,
            }}
          >
            <Search color={c.textSecondary} size={16} />
            <TextInput
              value={destQuery}
              onChangeText={setDestQuery}
              onFocus={() => setDestSearchFocused(true)}
              onBlur={() => setDestSearchFocused(false)}
              placeholder="Search destinations — e.g. Agra, Kerala"
              placeholderTextColor={c.textMuted}
              style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textPrimary, paddingVertical: 0 }}
            />
            {destQuery.length > 0 && (
              <Pressable onPress={() => setDestQuery("")} hitSlop={8}>
                <X color={c.textSecondary} size={14} />
              </Pressable>
            )}
          </View>

          {showDestSuggestions && (
            <View style={{ backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.border, marginTop: 8, overflow: "hidden" }}>
              {destSuggestions.length > 0 ? (
                destSuggestions.map((d, i) => (
                  <Pressable
                    key={d.id}
                    onPressIn={() => selectDestination(d)}
                    style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: c.borderSoft }}
                  >
                    <Image source={{ uri: d.image }} style={{ width: 36, height: 36, borderRadius: 8 }} contentFit="cover" />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary }} numberOfLines={1}>{d.name}</Text>
                      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }} numberOfLines={1}>{d.state}</Text>
                    </View>
                  </Pressable>
                ))
              ) : (
                <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary, padding: 12 }}>
                  No matches — try a different spelling, or browse all below.
                </Text>
              )}
            </View>
          )}

          {/* Popular row — hidden while actively searching so it doesn't
              compete with the dropdown above. Covers the common case
              (picking a well-known destination) without ever touching the
              full grid. */}
          {!showDestSuggestions && (
            <>
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: c.textSecondary, marginTop: 16, marginBottom: 10 }}>
                POPULAR
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                {POPULAR_DESTINATIONS.map((d) => {
                  const active = destination.id === d.id;
                  return (
                    <Pressable
                      key={d.id}
                      onPress={() => selectDestination(d)}
                      style={{ width: 96, height: 84, borderRadius: 14, overflow: "hidden", borderWidth: active ? 2.5 : 0, borderColor: "#333C81" }}
                    >
                      <Image source={{ uri: d.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                      <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.3)" }} />
                      <View style={{ position: "absolute", bottom: 6, left: 8, right: 6 }}>
                        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: "#FFFFFF" }} numberOfLines={1}>{d.name}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Pressable
                onPress={() => setShowAllDestinations((v) => !v)}
                style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 14 }}
              >
                <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, color: c.primary }}>
                  {showAllDestinations ? "Hide full list" : `Browse all ${VISIBLE_DESTINATIONS.length} destinations`}
                </Text>
                {showAllDestinations ? <ChevronUp color={c.primary} size={14} /> : <ChevronDown color={c.primary} size={14} />}
              </Pressable>

              {showAllDestinations && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                  {VISIBLE_DESTINATIONS.map((d) => {
                    const active = destination.id === d.id;
                    return (
                      <Pressable
                        key={d.id}
                        onPress={() => selectDestination(d)}
                        style={{ width: "48%", height: 88, borderRadius: 16, overflow: "hidden", borderWidth: active ? 2.5 : 0, borderColor: "#333C81" }}
                      >
                        <Image source={{ uri: d.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                        <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.25)" }} />
                        <View style={{ position: "absolute", bottom: 8, left: 10 }}>
                          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: "#FFFFFF" }}>{d.name}</Text>
                          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10, color: "rgba(255,255,255,0.8)" }}>{d.state}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </View>

        {/* Departure date + Days & Travellers */}
        <View onLayout={handleSectionLayout(2)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <Calendar color={c.textPrimary} size={14} />
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary }}>When are you going?</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 16 }}>
            <Pressable
              onPress={() => onStartDateChange(null)}
              style={{
                width: 72, height: 64, borderRadius: 14, alignItems: "center", justifyContent: "center",
                backgroundColor: startDate === null ? withOpacity(c.primary, 0.12) : c.surfaceAlt,
                borderWidth: 1.5, borderColor: startDate === null ? c.primary : "transparent",
              }}
            >
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: startDate === null ? c.primary : c.textSecondary, textAlign: "center" }}>
                Flexible{"\n"}dates
              </Text>
            </Pressable>
            {dateChips.map((d) => {
              const active = startDate === d.iso;
              return (
                <Pressable
                  key={d.iso}
                  onPress={() => onStartDateChange(d.iso)}
                  style={{
                    width: 52, height: 64, borderRadius: 14, alignItems: "center", justifyContent: "center",
                    backgroundColor: active ? c.primary : c.surfaceAlt,
                    borderWidth: 1.5, borderColor: active ? c.primary : "transparent",
                  }}
                >
                  <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 10, color: active ? "#FFFFFF" : c.textSecondary }}>{d.dow}</Text>
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 16, color: active ? "#FFFFFF" : c.textPrimary, marginTop: 2 }}>{d.dayNum}</Text>
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 9, color: active ? "rgba(255,255,255,0.8)" : c.textMuted }}>{d.month}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Stepper label="Days" value={days} min={1} max={21} onChange={onDaysChange} c={c} />
            <Stepper label="Travellers" value={people} min={1} max={20} onChange={onPeopleChange} c={c} />
          </View>
        </View>

        {/* Travel interests */}
        <View onLayout={handleSectionLayout(3)}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary, marginBottom: 12 }}>Travel Interests</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {PREFERENCES.map((p) => {
              const active = prefs.includes(p.id);
              return (
                <Pressable
                  key={p.id}
                  onPress={() => onTogglePref(p.id)}
                  style={{
                    width: "48%", paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12,
                    backgroundColor: active ? withOpacity(c.primary, 0.12) : c.surfaceAlt,
                    borderWidth: 1.5, borderColor: active ? c.primary : "transparent",
                  }}
                >
                  <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, color: active ? c.primary : c.textSecondary }}>{p.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* Sticky cost + CTA footer — previously an inline card near the
          bottom of the scroll (so it was disconnected from the style/
          days/travellers choices that drive it and only visible after
          scrolling all the way down). Now pinned to the screen, so the
          live budget/comfortable/premium price impact of every choice
          above is always in view, not just a final tally you have to
          scroll to check. Kept off `position: absolute` used for
          DestinationDetail's own sticky CTA (see that file) rather than
          the earlier floating-fixed approach that used to collide with
          the tab bar — ctaBottomInset already accounts for it. */}
      <View
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          paddingHorizontal: 16, paddingTop: 10, paddingBottom: ctaBottomInset,
          backgroundColor: withOpacity(c.bg, 0.97), borderTopWidth: 1, borderTopColor: c.borderSoft,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.textPrimary }} numberOfLines={1}>
              {originCity || "?"} → {destination.name} · {days}d · {people}p
            </Text>
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10, color: c.textSecondary, marginTop: 2 }}>
              {startDate ? formatDateLabel(startDate) : "Flexible dates"} · {sc.label}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 20, color: c.primary }}>
              ₹{estimatedTotal.toLocaleString("en-IN")}
            </Text>
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 9, color: c.textSecondary }}>estimated total</Text>
          </View>
        </View>

        <Pressable
          onPress={onGenerate}
          disabled={!canGenerate}
          style={{
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
            backgroundColor: canGenerate ? "#333C81" : c.surfaceAlt, borderRadius: 16, paddingVertical: 14,
          }}
        >
          <Sparkles color={canGenerate ? "#FFFFFF" : c.textMuted} size={16} />
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: canGenerate ? "#FFFFFF" : c.textMuted }}>
            Plan My {sc.label} Trip
          </Text>
        </Pressable>
      </View>

      <LocationPickerModal
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onConfirm={(label) => { setOriginCity(label); setShowMapPicker(false); }}
      />
    </View>
  );
}

function formatDateLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${WEEKDAY_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
}

function StyleRow({ label, value, color, c }: { label: string; value: string; color: string; c: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 10, color: c.textSecondary, width: 40 }}>{label}</Text>
      <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color, flex: 1 }}>{value}</Text>
    </View>
  );
}

function Stepper({ label, value, min, max, onChange, c }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void; c: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary, marginBottom: 8 }}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: c.surfaceAlt, borderRadius: 16, height: 52, overflow: "hidden" }}>
        <Pressable onPress={() => onChange(Math.max(min, value - 1))} style={{ width: 40, height: "100%", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 16, color: c.textMuted }}>−</Text>
        </Pressable>
        <Text style={{ flex: 1, textAlign: "center", fontFamily: "Poppins_700Bold", fontSize: 24, color: c.textPrimary }}>{value}</Text>
        <Pressable onPress={() => onChange(Math.min(max, value + 1))} style={{ width: 40, height: "100%", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 16, color: c.textMuted }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}
