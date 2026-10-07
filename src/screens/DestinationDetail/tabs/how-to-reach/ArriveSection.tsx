import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator, Modal, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Navigation, Compass as CompassIcon, Clock, Plus, X, MapPin, Lightbulb, ChevronUp, ChevronDown, RefreshCw } from "lucide-react-native";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import type { JourneyGuide } from "@/data/journeyGuides";
import { useOriginStore } from "@/store/useOriginStore";
import { useThemeColors } from "@/theme/useThemeColors";
import { useDetectLocation } from "@/hooks/useDetectLocation";
import { useCitySearch, formatCitySuggestion } from "@/hooks/useCitySearch";
import { Card, SectionLabel, Callout, rgba } from "./shared";
import { TravelModeIcon } from "./travelModeIcon";
import type { RouteInfoResult } from "./routeInfo";
import { estimateRouteInfoLocally } from "./localRouteEstimate";

// Fixed icon per mode rather than trusting the AI response for an exact
// TravelModeIcon-recognized string — the prompt asks for "Flight"/"Train"/
// "Road" but AI output isn't guaranteed to match the lookup table exactly.
const ROUTE_MODE_ICON: Record<string, string> = { Flight: "✈️", Train: "🚂", Bus: "🚌", Road: "🚗" };
const ROUTE_DEBOUNCE_MS = 600;

// Last-mile mode strings come from the AI (or the local estimate) and vary
// in wording ("Taxi/App cab", "Airport bus/shuttle", "Shared shuttle", …) —
// an exact-match table like ROUTE_MODE_ICON above would miss most of them,
// so this matches on keywords instead.
function lastMileIcon(mode: string): string {
  const m = mode.toLowerCase();
  if (m.includes("bus") || m.includes("shuttle")) return "🚌";
  if (m.includes("auto")) return "🛺";
  if (m.includes("metro") || m.includes("train") || m.includes("rail")) return "🚆";
  if (m.includes("walk")) return "🚶";
  if (m.includes("taxi") || m.includes("cab")) return "🚗";
  return "📍";
}

interface Props {
  destination: Destination;
  guide?: JourneyGuide;
}

export default function ArriveSection({ destination: d, guide }: Props) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const originCity = useOriginStore((s) => s.originCity);
  const setOriginCity = useOriginStore((s) => s.setOriginCity);
  const [sourceCity, setSourceCity] = useState(originCity);
  const [selectedTransport, setSelectedTransport] = useState(0);
  const { locating, detect } = useDetectLocation();

  // AI-generated distance + nearest airport + transport breakdown for
  // whatever origin is actually set — replaces the old Delhi/Mumbai/
  // Bangalore-only hardcoded transport text so every origin gets a real
  // answer, not just the three curated ones. Debounced and request-id
  // guarded the same way useCitySearch is, since sourceCity can also be
  // free-typed (not just picked from a suggestion).
  //
  // Deliberately NOT calling the AI backend (fetchRouteInfo /
  // POST /plan-trip/route-info) here — this panel is driven purely by
  // geocoding + haversine distance + the curated airport/station/state
  // datasets (see localRouteEstimate.ts), so browsing destinations and
  // trying different origins never spends AI quota/credits that other
  // features (itinerary planning, photo/fuzzy destination matching) still
  // need. The AI route-info endpoint itself is untouched on the backend —
  // only this screen stopped calling it — so it's a one-line revert
  // (swap estimateRouteInfoLocally back for fetchRouteInfo) if that
  // tradeoff ever changes.
  const [routeInfo, setRouteInfo] = useState<RouteInfoResult | null>(null);
  const [routeInfoLoading, setRouteInfoLoading] = useState(false);
  const [routeInfoError, setRouteInfoError] = useState(false);
  const routeRequestIdRef = useRef(0);
  const [routeRetryToken, setRouteRetryToken] = useState(0);

  useEffect(() => {
    const trimmed = sourceCity.trim();
    if (!trimmed) {
      setRouteInfo(null);
      setRouteInfoLoading(false);
      setRouteInfoError(false);
      return;
    }

    setRouteInfoLoading(true);
    setRouteInfoError(false);
    const timer = setTimeout(async () => {
      const requestId = ++routeRequestIdRef.current;
      const estimate = await estimateRouteInfoLocally(trimmed, { id: d.id, name: d.name, state: d.state });
      if (requestId !== routeRequestIdRef.current) return; // a newer request started — drop this stale response
      setRouteInfoLoading(false);
      if (estimate) {
        setRouteInfo(estimate);
        setSelectedTransport(0);
      } else {
        setRouteInfo(null);
        setRouteInfoError(true);
      }
    }, ROUTE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceCity, d.id, routeRetryToken]);
  // Which search is open in the full-screen overlay below — typing (and
  // the keyboard) happens there, over where the hero image sits, instead
  // of in a small inline field that the keyboard fights for space with.
  const [activeSearch, setActiveSearch] = useState<"origin" | "stop" | null>(null);
  const { suggestions } = useCitySearch(sourceCity);

  const pickSuggestion = (label: string) => {
    setSourceCity(label);
    setOriginCity(label);
    setActiveSearch(null);
  };

  // Waypoints between the origin and this destination — kept local to the
  // screen for now (not a shared store) since it's scoped to planning
  // this one trip. This is groundwork for a future multi-stop routing
  // map; there's no map view yet, just the ability to build the stop
  // list a map feature would eventually read.
  const [stops, setStops] = useState<Destination[]>([]);
  const [stopQuery, setStopQuery] = useState("");
  const addStop = (stop: Destination) => {
    setStops((prev) => [...prev, stop]);
    setActiveSearch(null);
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

  const selected = routeInfo?.transport[selectedTransport];

  return (
    <View style={{ gap: 16 }}>
      {/* Route planner. Not wrapped in the shared Card component here —
          Card sets overflow:"hidden" (needed elsewhere to clip images to
          its rounded corners), which would clip the floating dropdowns
          below at this box's edge instead of letting them overlay the
          content beneath them. */}
      <View style={{ backgroundColor: c.surface, borderRadius: 16, borderWidth: 1, borderColor: c.primary }}>
        <View style={{ padding: 16, backgroundColor: rgba(c.primary, 0.06), borderRadius: 16 }}>
          <SectionLabel color={c.primary}>Plan Your Route</SectionLabel>

          {/* Origin — tapping the field opens the full-screen search
              overlay below (over where the hero image sits) instead of
              typing inline, so the keyboard never has to compete with
              this card for space. The pin button still detects location
              with one tap, no need to open the overlay for that. */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <RouteMarker color={c.primary} />
            <Pressable
              onPress={() => setActiveSearch("origin")}
              style={{
                flex: 1, justifyContent: "center", backgroundColor: c.surfaceAlt, borderRadius: 12, height: 44, paddingHorizontal: 14,
              }}
            >
              <Text
                style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: sourceCity ? c.textPrimary : c.textMuted }}
                numberOfLines={1}
              >
                {sourceCity || "Search any city — e.g. Hyderabad"}
              </Text>
            </Pressable>
            <Pressable
              onPress={detectLocation}
              disabled={locating}
              style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: rgba(c.primary, 0.12), alignItems: "center", justifyContent: "center" }}
            >
              {locating ? <ActivityIndicator color={c.primary} size="small" /> : <MapPin color={c.primary} size={16} />}
            </Pressable>
          </View>

          <RouteConnector color={c.border} />

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

          {/* Add a stop — opens the same full-screen search overlay,
              in "stop" mode. */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ width: 20 }} />
            <Pressable
              onPress={() => setActiveSearch("stop")}
              style={{
                flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 40, borderRadius: 12,
                borderWidth: 1.5, borderColor: rgba(c.primary, 0.35), borderStyle: "dashed",
              }}
            >
              <Plus color={c.primary} size={14} />
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.primary }}>Add a stop along the way</Text>
            </Pressable>
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
      </View>

      {sourceCity.trim().length > 0 && (
        <>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.textSecondary, textAlign: "center" }}>
            {[sourceCity, ...stops.map((s) => s.name), d.name].join(" → ")}
          </Text>

          {routeInfo && (
            <>
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: c.primary, textAlign: "center" }}>
                ~{Math.round(routeInfo.distanceKm).toLocaleString("en-IN")} km from {sourceCity}
              </Text>
              {/* No AI call is made for this panel — see the useEffect above
                  for why — so every result here is this estimate, not just
                  a fallback case. Labelled plainly so it doesn't read as
                  survey-precise. */}
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10, color: c.textMuted, textAlign: "center" }}>
                Estimated from map distance, not AI-generated
              </Text>
            </>
          )}

          {/* Route breakdown — loading / error / content */}
          {routeInfoLoading && (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 10 }}>
              <ActivityIndicator color={c.primary} size="small" />
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary }}>Finding your route…</Text>
            </View>
          )}

          {!routeInfoLoading && routeInfoError && (
            <View style={{ alignItems: "center", gap: 8, paddingVertical: 10 }}>
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary, textAlign: "center" }}>
                Couldn't fetch route details right now.
              </Text>
              <Pressable
                onPress={() => setRouteRetryToken((n) => n + 1)}
                style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: rgba(c.primary, 0.1) }}
              >
                <RefreshCw color={c.primary} size={13} />
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.primary }}>Retry</Text>
              </Pressable>
            </View>
          )}

          {routeInfo && (
            <>
              {/* Transport mode chips */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {routeInfo.transport.map((t, i) => {
                  const active = selectedTransport === i;
                  return (
                    <Pressable
                      key={`${t.mode}-${i}`}
                      onPress={() => setSelectedTransport(i)}
                      style={{
                        flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14,
                        backgroundColor: active ? rgba(c.primary, 0.15) : c.surface,
                        borderWidth: 1.5, borderColor: active ? c.primary : c.border,
                      }}
                    >
                      <TravelModeIcon value={ROUTE_MODE_ICON[t.mode] ?? "📍"} color={active ? c.primary : c.textSecondary} size={16} />
                      <View>
                        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: active ? c.primary : c.textPrimary }}>{t.mode}</Text>
                        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10, color: active ? c.primary : c.textSecondary }}>{t.costRange}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {/* Selected transport detail — the full door-to-door route for
                  this mode: origin → (departure airport/station, for
                  Flight/Train) → arrival airport/station → last-mile leg →
                  actual destination. Road has no transfer points, so it's
                  just origin → destination with the drive itself as the
                  single leg. */}
              {selected && (
                <Card>
                  <View style={{ padding: 16, backgroundColor: rgba(c.teal, 0.06), borderBottomWidth: 1, borderBottomColor: c.border }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
                      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary, flexShrink: 1 }}>{selected.mode}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 0 }}>
                        <Clock color={c.textSecondary} size={12} />
                        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: c.textSecondary }}>{selected.duration}</Text>
                      </View>
                    </View>
                    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.teal }}>{selected.costRange}</Text>
                  </View>

                  <View style={{ padding: 16 }}>
                    <RouteStepRow color={c.primary} label={sourceCity} />

                    {selected.departurePoint && selected.arrivalPoint ? (
                      <>
                        <RouteLegConnector color={c.border} label={`${selected.mode} · ${selected.duration}`} />
                        <RouteStepRow
                          color={c.textMuted}
                          label={`${selected.departurePoint.name}${selected.departurePoint.code ? ` (${selected.departurePoint.code})` : ""}`}
                          sub={selected.departurePoint.distance}
                        />
                        <RouteConnector color={c.border} />
                        <RouteStepRow
                          color={c.textMuted}
                          label={`${selected.arrivalPoint.name}${selected.arrivalPoint.code ? ` (${selected.arrivalPoint.code})` : ""}`}
                          sub={selected.arrivalPoint.distance}
                        />

                        {/* Local transport onward from the arrival airport/
                            station — several alternatives (taxi, bus/
                            shuttle, auto), not just one prescribed mode, so
                            the traveller can actually choose. */}
                        {selected.lastMileOptions.length > 0 && (
                          <View style={{ marginLeft: 30, marginTop: 6, marginBottom: 2, gap: 6 }}>
                            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 9, letterSpacing: 0.5, color: c.textMuted, textTransform: "uppercase" }}>
                              Onward to {d.name}
                            </Text>
                            {selected.lastMileOptions.map((lm, i) => (
                              <View key={`${lm.mode}-${i}`}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                  <TravelModeIcon value={lastMileIcon(lm.mode)} color={c.textSecondary} size={13} />
                                  <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: c.textPrimary }}>{lm.mode}</Text>
                                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10, color: c.textSecondary, flex: 1 }} numberOfLines={1}>
                                    {[lm.duration, lm.costRange].filter(Boolean).join(" · ")}
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        )}

                        <RouteConnector color={c.border} />
                      </>
                    ) : (
                      <RouteLegConnector color={c.border} label={`${selected.mode} · ${selected.duration}`} />
                    )}

                    <RouteStepRow color={c.teal} shape="square" label={d.name} />
                  </View>

                  {!!selected.details && (
                    <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: c.textPrimary }}>{selected.details}</Text>
                    </View>
                  )}
                  {!!selected.tips && (
                    <View style={{ padding: 14, paddingTop: 0 }}>
                      <Callout icon={<Lightbulb color={c.gold} size={14} />} text={selected.tips} bg={rgba(c.gold, 0.1)} />
                    </View>
                  )}
                </Card>
              )}
            </>
          )}
        </>
      )}

      {guide ? (
        <>
          {/* Last-mile arrival points — fixed per destination (not tied to
              any origin), e.g. Agra always lists "Agra Cantt" as the train
              arrival point regardless of where the traveller is coming
              from. That's fine as a general reference when no origin is
              set yet, but once the dynamic route panel above has real,
              origin-specific Flight/Train/Bus/Road legs (with their own
              arrival points and last-mile options), showing this static
              version alongside it is actively misleading — it looks like
              "the train route" but never reflects the origin the user
              actually picked. Hide it once routeInfo has an answer. */}
          {!routeInfo && (
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
          )}

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

      {/* Full-screen search overlay — covers the hero image area (and
          everything else) while the user is actively searching for an
          origin city or a stop, so the keyboard never has to share space
          with the rest of the route card, and the full suggestions list
          is always visible. */}
      <Modal visible={activeSearch !== null} animationType="slide" onRequestClose={() => setActiveSearch(null)}>
        <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.border }}>
            <Pressable onPress={() => setActiveSearch(null)} hitSlop={8}>
              <X color={c.textSecondary} size={20} />
            </Pressable>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary }}>
              {activeSearch === "origin" ? "Where are you starting from?" : "Add a stop along the way"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 16 }}>
            <TextInput
              autoFocus
              value={activeSearch === "origin" ? sourceCity : stopQuery}
              onChangeText={activeSearch === "origin" ? setSourceCity : setStopQuery}
              placeholder={activeSearch === "origin" ? "Search any city — e.g. Hyderabad" : "Type a place name — e.g. Mysuru"}
              placeholderTextColor={c.textMuted}
              style={{
                flex: 1, backgroundColor: c.surfaceAlt, borderRadius: 12, height: 48, paddingHorizontal: 14,
                fontFamily: "Poppins_400Regular", fontSize: 14, color: c.textPrimary,
              }}
            />
            {activeSearch === "origin" && (
              <Pressable
                onPress={detectLocation}
                disabled={locating}
                style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: rgba(c.primary, 0.12), alignItems: "center", justifyContent: "center" }}
              >
                {locating ? <ActivityIndicator color={c.primary} size="small" /> : <MapPin color={c.primary} size={18} />}
              </Pressable>
            )}
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }} keyboardShouldPersistTaps="handled">
            {activeSearch === "origin"
              ? suggestions.map((s) => {
                  const label = formatCitySuggestion(s);
                  return (
                    <Pressable
                      key={s.id}
                      onPress={() => pickSuggestion(label)}
                      style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.borderSoft }}
                    >
                      <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, color: c.textPrimary }}>{s.name}</Text>
                      {(s.admin1 || s.country) && (
                        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary, marginTop: 2 }}>
                          {[s.admin1, s.country].filter(Boolean).join(", ")}
                        </Text>
                      )}
                    </Pressable>
                  );
                })
              : stopMatches.map((dest) => (
                  <Pressable
                    key={dest.id}
                    onPress={() => addStop(dest)}
                    style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.borderSoft }}
                  >
                    <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, color: c.textPrimary }}>{dest.name}</Text>
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary, marginTop: 2 }}>{dest.state}</Text>
                  </Pressable>
                ))}
            {activeSearch === "stop" && stopMatchQuery.length > 0 && stopMatches.length === 0 && (
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textSecondary, paddingVertical: 14 }}>
                No matches for "{stopQuery.trim()}"
              </Text>
            )}
          </ScrollView>
        </View>
      </Modal>
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

/** One stop on the "selected transport detail" door-to-door timeline —
 * origin, a transfer point (airport/station), or the destination — reusing
 * RouteMarker for visual consistency with the route-planner section above. */
function RouteStepRow({ color, label, sub, shape = "circle" }: { color: string; label: string; sub?: string; shape?: "circle" | "square" }) {
  const c = useThemeColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <RouteMarker color={color} shape={shape} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, color: c.textPrimary }} numberOfLines={1}>
          {label}
        </Text>
        {!!sub && (
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10, color: c.textSecondary }} numberOfLines={1}>
            {sub}
          </Text>
        )}
      </View>
    </View>
  );
}

/** Like RouteConnector, but for a leg of the "selected transport detail"
 * timeline that itself represents travel (the flight/train hop, or the
 * last-mile taxi/bus) — taller, and with an optional caption describing
 * that leg (mode · duration · cost) next to the line. */
function RouteLegConnector({ color, label }: { color: string; label?: string }) {
  const c = useThemeColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 22 }}>
      <View style={{ width: 20, alignItems: "center" }}>
        <View style={{ width: 2, height: 22, backgroundColor: color }} />
      </View>
      {!!label && (
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 10, color: c.textSecondary, flex: 1 }} numberOfLines={1}>
          {label}
        </Text>
      )}
    </View>
  );
}
