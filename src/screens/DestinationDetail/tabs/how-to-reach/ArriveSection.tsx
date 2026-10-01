import { useRef, useState } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator } from "react-native";
import { Navigation, Zap, Compass as CompassIcon, Clock, Plus, X, MapPin, Lightbulb, ChevronUp, ChevronDown } from "lucide-react-native";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import type { JourneyGuide } from "@/data/journeyGuides";
import { useOriginStore } from "@/store/useOriginStore";
import { useThemeColors } from "@/theme/useThemeColors";
import { useDetectLocation } from "@/hooks/useDetectLocation";
import { useCitySearch, formatCitySuggestion } from "@/hooks/useCitySearch";
import { Card, SectionLabel, Callout, NumberBadge, rgba } from "./shared";
import { TravelModeIcon } from "./travelModeIcon";

interface Props {
  destination: Destination;
  guide?: JourneyGuide;
  onSearchFocusChange?: (ref: TextInput | null) => void;
}

export default function ArriveSection({ destination: d, guide, onSearchFocusChange }: Props) {
  const c = useThemeColors();
  const originCity = useOriginStore((s) => s.originCity);
  const setOriginCity = useOriginStore((s) => s.setOriginCity);
  const [sourceCity, setSourceCity] = useState(originCity);
  const [selectedTransport, setSelectedTransport] = useState(0);
  const searchInputRef = useRef<TextInput>(null);
  const { locating, detect } = useDetectLocation();
  const [searchFocused, setSearchFocused] = useState(false);
  const { suggestions } = useCitySearch(sourceCity);
  const showSuggestions = searchFocused && suggestions.length > 0;

  const pickSuggestion = (label: string) => {
    setSourceCity(label);
    setOriginCity(label);
    setSearchFocused(false);
  };

  // Waypoints between the origin and this destination — kept local to the
  // screen for now (not a shared store) since it's scoped to planning
  // this one trip. This is groundwork for a future multi-stop routing
  // map; there's no map view yet, just the ability to build the stop
  // list a map feature would eventually read.
  const [stops, setStops] = useState<Destination[]>([]);
  const [showStopPicker, setShowStopPicker] = useState(false);
  const [stopQuery, setStopQuery] = useState("");
  const addStop = (stop: Destination) => {
    setStops((prev) => [...prev, stop]);
    setShowStopPicker(false);
    setStopQuery("");
  };
  const removeStop = (id: string) => setStops((prev) => prev.filter((s) => s.id !== id));
  // Lets a user plan their preferred visiting order rather than only the
  // order they happened to add stops in — swaps the stop with its
  // immediate neighbor, a no-op at either end of the list.
  const moveStop = (index: number, direction: -1 | 1) => {
    setStops((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  // Filtered by what's typed, not a full render of every destination —
  // that grid of ~1,700 image cards (one DestImage each, loaded over the
  // network) was the actual source of the slowdown being reported, not
  // just a UX nicety. Capped to 8 matches for the same reason a dropdown
  // of every possible match would still be unusable.
  const stopMatchQuery = stopQuery.trim().toLowerCase();
  const stopMatches =
    stopMatchQuery.length > 0
      ? DESTINATIONS.filter(
          (dest) =>
            dest.id !== d.id &&
            !stops.find((s) => s.id === dest.id) &&
            (dest.name.toLowerCase().includes(stopMatchQuery) || dest.state.toLowerCase().includes(stopMatchQuery)),
        ).slice(0, 8)
      : [];

  const detectLocation = async () => {
    const city = await detect();
    if (city) {
      setSourceCity(city);
      setOriginCity(city);
    }
  };

  const selected = d.transport[selectedTransport];

  return (
    <View style={{ gap: 16 }}>
      {/* Route planner */}
      <Card borderColor={c.primary}>
        <View style={{ padding: 16, backgroundColor: rgba(c.primary, 0.06) }}>
          <SectionLabel color={c.primary}>Plan Your Route</SectionLabel>

          {/* Origin — teal dot marks the start of the journey; the dotted
              line below ties it to whatever comes next (suggestions aside,
              which is a transient overlay on this field, not a journey
              step). */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <RouteMarker color={c.primary} />
            <TextInput
              ref={searchInputRef}
              value={sourceCity}
              onChangeText={setSourceCity}
              onFocus={() => {
                setSearchFocused(true);
                onSearchFocusChange?.(searchInputRef.current);
              }}
              onBlur={() => {
                setSearchFocused(false);
                onSearchFocusChange?.(null);
              }}
              placeholder="Search any city — e.g. Hyderabad"
              placeholderTextColor={c.textMuted}
              style={{
                flex: 1, backgroundColor: c.surfaceAlt, borderRadius: 12, height: 44, paddingHorizontal: 14,
                fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textPrimary,
              }}
            />
            <Pressable
              onPress={detectLocation}
              disabled={locating}
              style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: rgba(c.primary, 0.12), alignItems: "center", justifyContent: "center" }}
            >
              {locating ? <ActivityIndicator color={c.primary} size="small" /> : <MapPin color={c.primary} size={16} />}
            </Pressable>
          </View>

          {/* Live search results — tapping one sets both the visible field
              and the shared origin city, same as detecting location does. */}
          {showSuggestions ? (
            <View style={{ marginLeft: 30, marginTop: 8, backgroundColor: c.surface, borderRadius: 12, borderWidth: 1, borderColor: c.border, overflow: "hidden" }}>
              {suggestions.map((s, i) => {
                const label = formatCitySuggestion(s);
                return (
                  <Pressable
                    key={s.id}
                    // onPressIn fires before the TextInput's onBlur closes
                    // this list — onPress alone would never get a chance to
                    // fire, since the field loses focus (and hides this
                    // list) first.
                    onPressIn={() => pickSuggestion(label)}
                    style={{ paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: c.borderSoft }}
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
          ) : (
            <RouteConnector color={c.border} />
          )}

          {/* Waypoints — additional places to visit along the way, in the
              order the user wants to visit them (not just the order they
              were added — the up/down arrows reorder in place). */}
          {stops.map((stop, i) => (
            <View key={stop.id}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <RouteMarker color={c.textMuted} size={8} />
                <View
                  style={{
                    flex: 1, flexDirection: "row", alignItems: "center", gap: 2, height: 44, borderRadius: 12,
                    paddingLeft: 14, paddingRight: 6, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border,
                  }}
                >
                  <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary, flex: 1 }} numberOfLines={1}>
                    {stop.name}, {stop.state}
                  </Text>
                  <Pressable onPress={() => moveStop(i, -1)} disabled={i === 0} hitSlop={6} style={{ padding: 6, opacity: i === 0 ? 0.3 : 1 }}>
                    <ChevronUp color={c.textSecondary} size={16} />
                  </Pressable>
                  <Pressable onPress={() => moveStop(i, 1)} disabled={i === stops.length - 1} hitSlop={6} style={{ padding: 6, opacity: i === stops.length - 1 ? 0.3 : 1 }}>
                    <ChevronDown color={c.textSecondary} size={16} />
                  </Pressable>
                  <Pressable onPress={() => removeStop(stop.id)} hitSlop={6} style={{ padding: 6 }}>
                    <X color={c.textMuted} size={16} />
                  </Pressable>
                </View>
              </View>
              <RouteConnector color={c.border} />
            </View>
          ))}

          {/* Add a stop */}
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
            <View style={{ width: 20 }} />
            <View style={{ flex: 1 }}>
              {showStopPicker ? (
                <View style={{ gap: 8 }}>
                  <TextInput
                    value={stopQuery}
                    onChangeText={setStopQuery}
                    autoFocus
                    placeholder="Type a place name — e.g. Mysuru"
                    placeholderTextColor={c.textMuted}
                    style={{
                      backgroundColor: c.surfaceAlt, borderRadius: 12, height: 44, paddingHorizontal: 14,
                      fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textPrimary,
                    }}
                  />
                  {stopMatches.length > 0 && (
                    <View style={{ backgroundColor: c.surface, borderRadius: 12, borderWidth: 1, borderColor: c.border, overflow: "hidden" }}>
                      {stopMatches.map((dest, i) => (
                        <Pressable
                          key={dest.id}
                          onPress={() => addStop(dest)}
                          style={{ paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: c.borderSoft }}
                        >
                          <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary }}>{dest.name}</Text>
                          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary, marginTop: 1 }}>{dest.state}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                  {stopMatchQuery.length > 0 && stopMatches.length === 0 && (
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary, paddingHorizontal: 2 }}>
                      No matches for "{stopQuery.trim()}"
                    </Text>
                  )}
                  <Pressable
                    onPress={() => {
                      setShowStopPicker(false);
                      setStopQuery("");
                    }}
                    style={{ alignSelf: "flex-start" }}
                  >
                    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.textSecondary }}>Cancel</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => setShowStopPicker(true)}
                  style={{
                    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 40, borderRadius: 12,
                    borderWidth: 1.5, borderColor: rgba(c.primary, 0.35), borderStyle: "dashed",
                  }}
                >
                  <Plus color={c.primary} size={14} />
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.primary }}>Add a stop along the way</Text>
                </Pressable>
              )}
            </View>
          </View>

          <RouteConnector color={c.border} />

          {/* Destination — fixed to this page's own destination, so it's
              styled distinctly (teal square, "Fixed" tag) from the
              editable rows above rather than looking like just another
              input. */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <RouteMarker color={c.teal} shape="square" />
            <View
              style={{
                flex: 1, flexDirection: "row", alignItems: "center", gap: 8, height: 44, borderRadius: 12,
                paddingHorizontal: 14, backgroundColor: rgba(c.teal, 0.08), borderWidth: 1, borderColor: rgba(c.teal, 0.25),
              }}
            >
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary, flex: 1 }} numberOfLines={1}>
                {d.name}, {d.state}
              </Text>
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 9, letterSpacing: 0.5, color: c.teal }}>FIXED</Text>
            </View>
          </View>
        </View>
      </Card>

      {sourceCity.trim().length > 0 && (
        <>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.textSecondary, textAlign: "center" }}>
            {[sourceCity, ...stops.map((s) => s.name), d.name].join(" → ")}
          </Text>

          {/* Transport mode chips */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {d.transport.map((t, i) => {
              const active = selectedTransport === i;
              return (
                <Pressable
                  key={t.mode}
                  onPress={() => setSelectedTransport(i)}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14,
                    backgroundColor: active ? rgba(c.primary, 0.15) : c.surface,
                    borderWidth: 1.5, borderColor: active ? c.primary : c.border,
                  }}
                >
                  <TravelModeIcon value={t.icon} color={active ? c.primary : c.textSecondary} size={16} />
                  <View>
                    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: active ? c.primary : c.textPrimary }}>{t.mode}</Text>
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10, color: active ? c.primary : c.textSecondary }}>{t.costRange}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Selected transport detail */}
          {selected && (
            <Card>
              <View style={{ padding: 16, backgroundColor: rgba(c.teal, 0.06), borderBottomWidth: 1, borderBottomColor: c.border }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary, flexShrink: 1 }}>{selected.mode}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <Clock color={c.textSecondary} size={12} />
                    <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: c.textSecondary }}>{selected.duration}</Text>
                  </View>
                </View>

                <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: c.textSecondary, marginBottom: 8 }}>
                  Typical routes from major cities:
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {[
                    { from: "Delhi", info: selected.fromDelhi },
                    { from: "Mumbai", info: selected.fromMumbai },
                    { from: "Bengaluru", info: selected.fromBangalore },
                  ]
                    .filter((r) => r.info && r.info !== "—")
                    .map((r) => (
                      <View key={r.from} style={{ flex: 1, backgroundColor: rgba(c.teal, 0.1), borderRadius: 10, padding: 8, alignItems: "center" }}>
                        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 10, color: c.teal, marginBottom: 2 }}>{r.from}</Text>
                        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10, color: c.textPrimary, textAlign: "center" }}>{r.info}</Text>
                      </View>
                    ))}
                </View>
              </View>
              <View style={{ padding: 14 }}>
                <Callout icon={<Lightbulb color={c.gold} size={14} />} text={selected.tips} bg={rgba(c.gold, 0.1)} />
              </View>
            </Card>
          )}
        </>
      )}

      {guide ? (
        <>
          {/* First hour */}
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderBottomWidth: 1, borderBottomColor: c.border }}>
              <Zap color={c.primary} size={16} />
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>Your First Hour in {d.name}</Text>
            </View>
            <View style={{ padding: 14, gap: 12 }}>
              {guide.firstThingsToDo.map((step, i) => (
                <View key={step} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                  <NumberBadge n={i + 1} color={i === 0 ? "#333C81" : "#0D5C63"} />
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: c.textPrimary, flex: 1 }}>{step}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Last-mile arrival points */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Navigation color={c.teal} size={16} />
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>Last-Mile to Your Stay</Text>
            </View>
            <View style={{ gap: 12 }}>
              {guide.arrivalPoints.map((ap) => (
                <Card key={ap.name}>
                  <View style={{ padding: 14, backgroundColor: rgba(c.teal, 0.08), borderBottomWidth: 1, borderBottomColor: c.border }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <TravelModeIcon value={ap.icon} color={c.teal} size={17} />
                      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>{ap.by}</Text>
                    </View>
                    <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: c.teal }}>{ap.name}</Text>
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{ap.distanceFromCity}</Text>
                  </View>
                  <View style={{ padding: 12, gap: 10 }}>
                    {ap.toAccommodation.map((step) => (
                      <View key={step.step} style={{ flexDirection: "row", gap: 10 }}>
                        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center" }}>
                          <TravelModeIcon value={step.icon} color={c.textSecondary} size={13} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11.5, color: c.textPrimary, marginBottom: 3 }}>{step.action}</Text>
                          <View style={{ flexDirection: "row", gap: 10, marginBottom: 4 }}>
                            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.primary }}>{step.cost}</Text>
                            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{step.duration}</Text>
                          </View>
                          <Callout icon={<Lightbulb color={c.gold} size={14} />} text={step.tip} bg={rgba(c.gold, 0.1)} />
                        </View>
                      </View>
                    ))}
                  </View>
                </Card>
              ))}
            </View>
          </View>

          {/* City to sight */}
          <View style={{ backgroundColor: rgba(c.teal, 0.1), borderWidth: 1, borderColor: rgba(c.teal, 0.25), borderRadius: 16, padding: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <CompassIcon color={c.teal} size={16} />
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.teal }}>City → Main Attraction</Text>
            </View>
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: c.textPrimary }}>{guide.fromCityToSight}</Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

/** A 20px-wide gutter with a centered dot/square — the "stop marker" on
 * the route line. Always 20px wide regardless of `size` so every row's
 * marker lines up in the same column, and RouteConnector's own
 * marginLeft (half of 20, minus half its own width) lines up under it. */
function RouteMarker({ color, size = 10, shape = "circle" }: { color: string; size?: number; shape?: "circle" | "square" }) {
  return (
    <View style={{ width: 20, alignItems: "center" }}>
      <View style={{ width: size, height: size, borderRadius: shape === "circle" ? size / 2 : 3, backgroundColor: color }} />
    </View>
  );
}

/** The short connecting segment between two route rows, centered under
 * RouteMarker's dot (column is 20px wide, so a 2px line sits at
 * marginLeft: 9 to center itself at x=10). */
function RouteConnector({ color }: { color: string }) {
  return <View style={{ width: 2, height: 14, marginLeft: 9, backgroundColor: color }} />;
}
