/**
 * "How to get there" on a destination's home page, straight under Places Near.
 * One row per way of reaching the place (by air, train, road, water...): its plain
 * name, where you arrive, the time and cost side by side, and small word badges
 * (Fastest, Cheapest, Book ahead). Tap a row to open its journey: the time and
 * cost in full, where to arrive with a Directions button, the tip, and the steps
 * from the airport or station to a stay. One row is open at a time, the first to
 * start. Under the rows: how to get from there to the main sight, what getting
 * around costs once you are there, and a button to the route planner page (which
 * asks where you are starting from).
 *
 * It can be made personal. A friendly card asks "Where are you travelling from?" (Use my
 * location, or Choose a city); once a city is set it becomes a "From Chennai" chip, and
 * each way shows where to leave from (the nearest airport, station or bus stand to that
 * city), how far the place is, and a rough time. The ways, arrival points and fares still
 * come from the place's own guide, so nothing is invented for it. The phone is asked for
 * location only when "Use my location" is tapped, and a refusal never blocks anything.
 *
 * The text comes from the place's own guide (utils/howToReach.ts). Sizes follow
 * the redesign's rules: nothing under 12pt, buttons of at least 44pt, and text
 * that wraps at 130% instead of being cut off.
 */
import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, useWindowDimensions } from "react-native";
import { Bike, Bus, Car, ChevronDown, ChevronUp, Compass, Footprints, Info, LocateFixed, Lock, MapPin, Navigation, Plane, Route, Search, Ship, TrainFront } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { getJourneyGuide } from "@/data/journeyGuides";
import { localModes, personalise, reachModes, sightText, type LocalIcon, type PersonalMode, type ReachKind, type StepIcon } from "@/utils/howToReach";
import { getLocationPermission, useDetectLocation, type DetectResult } from "@/hooks/useDetectLocation";
import { useOriginStore } from "@/store/useOriginStore";
import { getGateways } from "@/data/placeGateways";
import GettingThere from "./tabs/how-to-reach/GettingThere";
import { estimateRouteInfoLocally, haversineKm } from "./tabs/how-to-reach/localRouteEstimate";
import type { RouteInfoResult } from "./tabs/how-to-reach/routeInfo";
import OriginPicker, { shortCity } from "./OriginPicker";
import { openMapDirections, openMapSearch } from "@/utils/openMaps";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";

const MAX_FONT = 1.3;

const KIND_ICON: Record<ReachKind, typeof Plane> = { flight: Plane, train: TrainFront, water: Ship, road: Car, other: Route };
const STEP_ICON: Record<StepIcon, typeof Car> = { bike: Bike, car: Car, bus: Bus, footprints: Footprints, pin: MapPin };
const LOCAL_ICON: Record<LocalIcon, typeof Car> = { ship: Ship, bike: Bike, bus: Bus, footprints: Footprints, car: Car };
const ESTIMATES = new Map<string, RouteInfoResult | null>();
const REFRESH_AFTER_MS = 30 * 60 * 1000;

const NOTICE: Record<Extract<DetectResult, { ok: false }>["reason"], string> = {
  "services-off": "Location is switched off on your phone. Turn it on, or choose your city instead.",
  denied: "Location is off for this app. No problem: choose your city instead. You can turn it on later in your phone's Settings.",
  blocked: "Location is off for this app. No problem: choose your city instead. You can turn it on later in your phone's Settings.",
  "no-fix": "We couldn't find you just now (the signal may be weak). Try again, or choose your city instead.",
  failed: "Something went wrong finding your location. Please choose your city instead.",
};
const STEP_HEAD: Record<ReachKind, string> = { flight: "the airport", train: "the station", water: "the jetty", road: "the bus stand", other: "where you arrive" };

export default function HowToGetThere({ destination: d, onOpenPlanner }: { destination: Destination; onOpenPlanner: () => void }) {
  const c = useThemeColors();
  const { width } = useWindowDimensions();
  const guide = getJourneyGuide(d.id);
  const placeName = d.name.replace(/\s*\([^)]*\)/g, "").trim();
  const originCity = useOriginStore((st) => st.originCity);
  const originSource = useOriginStore((st) => st.originSource);
  const originPoint = useOriginStore((st) => st.originPoint);
  const originFixedAt = useOriginStore((st) => st.originFixedAt);
  const recentOrigins = useOriginStore((st) => st.recentOrigins);
  const setOrigin = useOriginStore((st) => st.setOrigin);
  const originShort = originCity ? shortCity(originCity) : "";
  const exact = originSource === "gps" && originPoint ? originPoint : null;
  const { locating, detectQuietly } = useDetectLocation();
  const [permission, setPermission] = useState<"granted" | "denied" | "unasked">("unasked");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<RouteInfoResult | null>(null);
  const [estimateState, setEstimateState] = useState<"idle" | "loading" | "done" | "failed">("idle");

  useEffect(() => {
    void getLocationPermission().then(setPermission);
  }, []);

  // The routes from the chosen city: worked out on the phone from the nearest airport / station lists
  // and map distance (no server, no AI), remembered for the session so changing places is instant.
  useEffect(() => {
    if (!originCity) {
      setEstimate(null);
      setEstimateState("idle");
      return;
    }
    const key = exact ? `${d.id}|gps:${exact.lat.toFixed(3)},${exact.lon.toFixed(3)}` : `${d.id}|${originCity}`;
    if (ESTIMATES.has(key)) {
      const hit = ESTIMATES.get(key) ?? null;
      setEstimate(hit);
      setEstimateState(hit ? "done" : "failed");
      return;
    }
    let cancelled = false;
    setEstimateState("loading");
    void estimateRouteInfoLocally(originCity, { id: d.id, name: d.name, state: d.state }, exact ? { lat: exact.lat, lon: exact.lon } : null)
      .catch(() => null)
      .then((result) => {
        ESTIMATES.set(key, result);
        if (cancelled) return;
        setEstimate(result);
        setEstimateState(result ? "done" : "failed");
      });
    return () => {
      cancelled = true;
    };
  }, [originCity, exact?.lat, exact?.lon, d.id, d.name, d.state]);

  const useMyLocation = async () => {
    setNotice(null);
    const result = await detectQuietly();
    if (result.ok) {
      setOrigin(result.city, "gps", { lat: result.lat, lon: result.lon, approximate: result.approximate });
      setPermission("granted");
      setPickerOpen(false);
      return;
    }
    if (result.reason === "denied" || result.reason === "blocked") setPermission("denied");
    setNotice(NOTICE[result.reason]);
  };

  // A start that came from the phone's position goes stale when the person moves, so (only if the phone already
  // allows it, and at most every 30 minutes) it is quietly read again when the section opens.
  useEffect(() => {
    if (originSource !== "gps" || permission !== "granted" || Date.now() - originFixedAt < REFRESH_AFTER_MS) return;
    let cancelled = false;
    void detectQuietly().then((result) => {
      if (cancelled || !result.ok) return;
      setOrigin(result.city, "gps", { lat: result.lat, lon: result.lon, approximate: result.approximate });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originSource, permission]);
  const choose = (city: string) => {
    setOrigin(city, "picked");
    setNotice(null);
    setPickerOpen(false);
  };

  const baseModes = reachModes(d, guide);
  const modes: PersonalMode[] = personalise(baseModes, originCity && estimateState === "done" ? estimate : null, originShort, !!exact);
  // Places whose nearest airport, station and bus station have been checked get the Fly / Train / Bus tabs; the rest keep the rows.
  const gateways = getGateways(d.id);
  const sight = sightText(guide);
  const local = localModes(d);
  const [openKey, setOpenKey] = useState<string | null>(() => modes[0]?.key ?? null);
  const kindColor: Record<ReachKind, string> = { flight: c.teal, train: c.gold, road: "#7CC4FF", water: "#A78BFA", other: c.gold };
  const tileWidth = (width - 32 - 10) / 2;

  const Badge = ({ text, color }: { text: string; color: string }) => (
    <View style={{ borderWidth: 1, borderColor: withOpacity(color, 0.55), borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 }}>
      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 12, lineHeight: 17, color }}>{text}</Text>
    </View>
  );

  return (
    <View style={{ marginTop: 24 }}>
      <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 20, lineHeight: 27, color: c.textPrimary, paddingHorizontal: 20 }}>
        How to get there
      </Text>
      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary, paddingHorizontal: 20, marginTop: 2, marginBottom: 12 }}>
        {gateways ? "Pick how you'll travel. We show the nearest place to book to, then the short transfer." : originCity ? (exact ? "Showing routes from where you are. Tap one for the journey." : "Showing routes from your city. Tap one for the journey.") : "All the ways at a glance. Tap one for the journey."}
      </Text>

      {gateways ? (
        <View style={{ marginHorizontal: 16 }}>
          <GettingThere place={placeName} gateways={gateways} origin={originShort} onChangeOrigin={() => setPickerOpen(true)} pickerOpen={pickerOpen} />
        </View>
      ) : (
        <>
      {originCity ? (
        <>
          <Pressable
            onPress={() => setPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`Starting from ${originShort}. Change`}
            android_ripple={{ color: withOpacity(c.gold, 0.14) }}
            style={{ marginHorizontal: 16, minHeight: 56, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1.5, borderColor: c.gold, backgroundColor: withOpacity(c.gold, 0.1) }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: withOpacity(c.gold, 0.2), alignItems: "center", justifyContent: "center" }}>
              {originSource === "gps" ? <LocateFixed color={c.gold} size={18} /> : <MapPin color={c.gold} size={18} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, lineHeight: 17, color: c.textSecondary }}>From</Text>
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 16, lineHeight: 22, color: c.textPrimary }}>{originShort}</Text>
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textSecondary }}>{exact ? (exact.approximate ? "Using your approximate location" : "Using your exact location") : "You chose this city"}</Text>
            </View>
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 13, lineHeight: 18, color: c.gold }}>Change</Text>
            <ChevronDown color={c.gold} size={18} />
          </Pressable>
          {exact?.approximate ? (
            <View style={{ flexDirection: "row", gap: 8, marginHorizontal: 16, marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: withOpacity(c.gold, 0.1) }}>
              <Info color={c.gold} size={16} style={{ marginTop: 3 }} />
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20, color: c.textPrimary }}>
                Your phone shared only an approximate location, so the nearest airport and station may be a little off. For exact routes, turn on Precise location for this app in Settings.
              </Text>
            </View>
          ) : null}
          {estimateState === "loading" ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingTop: 10 }}>
              <ActivityIndicator size="small" color={c.textSecondary} />
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary }}>Finding routes from {exact ? "you" : originShort}…</Text>
            </View>
          ) : estimateState === "done" && estimate ? (
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, paddingHorizontal: 20, paddingTop: 10 }}>
              <Route color={c.gold} size={15} style={{ marginTop: 3 }} />
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary }}>
                <Text style={{ fontFamily: "Poppins_700Bold", color: c.textPrimary }}>About {estimate.distanceKm.toLocaleString("en-IN")} km</Text> from {exact ? "you" : originShort}. Estimated from the map.
              </Text>
            </View>
          ) : estimateState === "failed" ? (
            <View style={{ flexDirection: "row", gap: 8, marginHorizontal: 16, marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: withOpacity(c.gold, 0.1) }}>
              <Info color={c.gold} size={16} style={{ marginTop: 3 }} />
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20, color: c.textPrimary }}>
                We couldn't work out routes from {exact ? "you" : originShort} just now, so these are the general ways. Try again later or choose another city.
              </Text>
            </View>
          ) : null}
          <View style={{ height: 10 }} />
        </>
      ) : (
        <View style={{ marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 16, borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surfaceAlt }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <MapPin color={c.gold} size={22} />
            <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_700Bold", fontSize: 16, lineHeight: 22, color: c.textPrimary }}>Where are you travelling from?</Text>
          </View>
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 21, color: c.textSecondary, marginTop: 6 }}>
            Share your location, or choose a city, and we'll show the nearest airport and station, and how far it is.
          </Text>
          {notice ? (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: withOpacity(c.gold, 0.1) }}>
              <Info color={c.gold} size={16} style={{ marginTop: 3 }} />
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20, color: c.textPrimary }}>{notice}</Text>
            </View>
          ) : null}
          <View style={{ gap: 8, marginTop: 12 }}>
            {permission === "denied" ? null : (
              <Pressable
                onPress={() => void useMyLocation()}
                disabled={locating}
                accessibilityRole="button"
                accessibilityLabel={locating ? "Finding your city" : "Use my location"}
                android_ripple={{ color: withOpacity(c.onPrimary, 0.2) }}
                style={{ minHeight: 52, borderRadius: 12, backgroundColor: c.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8 }}
              >
                {locating ? <ActivityIndicator color={c.onPrimary} /> : <LocateFixed color={c.onPrimary} size={19} />}
                <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14.5, lineHeight: 20, color: c.onPrimary }}>{locating ? "Finding your city…" : "Use my location"}</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => setPickerOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Choose a city"
              android_ripple={{ color: withOpacity(c.gold, 0.14) }}
              style={{ minHeight: 48, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8 }}
            >
              <Search color={c.gold} size={18} />
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, lineHeight: 20, color: c.textPrimary }}>Choose a city</Text>
            </Pressable>
          </View>
          {permission === "denied" ? null : (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <Lock color={c.textSecondary} size={14} style={{ marginTop: 3 }} />
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 19, color: c.textSecondary }}>
                Your exact location stays on your phone. We use it only to find the nearest airport, station and bus stand, and never send it to our servers.
              </Text>
            </View>
          )}
        </View>
      )}

      <View
        // Keyed by the start city and the lookup state so the rows are laid out afresh whenever the start changes
        // (on iPhone the paragraphs inside were otherwise left clipped by the earlier layout).
        key={`rows-${originCity}-${estimateState}`}
        style={{ marginHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: c.borderSoft, backgroundColor: c.surfaceAlt, overflow: "hidden" }}
      >
        {modes.map((m, i) => {
          const open = openKey === m.key;
          const Icon = KIND_ICON[m.kind];
          const subtitle = m.departure ? `Leave from ${m.departure.short}` : m.arrivalName ? m.arrivalName.split(/ — | \(/)[0] : (m.tip.split(/(?<=[.!?])\s/)[0] ?? "");
          const shownTime = m.departure ? m.personalTime : m.durationShort;
          const hasBadges = m.fastest || m.cheapest || m.bookAhead;
          const spoken = [m.label, m.departure ? `leave from ${m.departure.short}` : m.arrivalName, [shownTime, m.costShort].filter(Boolean).join(", "), m.fastest ? "fastest" : "", m.cheapest ? "cheapest" : "", m.bookAhead ? "book ahead" : ""].filter(Boolean).join(". ");
          return (
            <View key={m.key} style={{ borderTopWidth: i ? 1 : 0, borderTopColor: c.borderSoft, backgroundColor: open ? withOpacity(c.gold, 0.06) : "transparent" }}>
              <Pressable
                onPress={() => setOpenKey(open ? null : m.key)}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                aria-expanded={open}
                accessibilityLabel={`${spoken}. ${open ? "Open, tap to close" : "Closed, tap to open"}`}
                android_ripple={{ color: withOpacity(c.gold, 0.12) }}
                style={{ paddingHorizontal: 14, paddingVertical: 12 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: open ? withOpacity(c.gold, 0.18) : c.surface, alignItems: "center", justifyContent: "center" }}>
                    <Icon color={kindColor[m.kind]} size={22} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 16, lineHeight: 21, color: c.textPrimary }}>{m.label}</Text>
                    {subtitle ? (
                      <Text maxFontSizeMultiplier={MAX_FONT} numberOfLines={2} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 17, color: c.textSecondary }}>{subtitle}</Text>
                    ) : null}
                  </View>
                  <View style={{ alignItems: "flex-end", maxWidth: 112 }}>
                    {shownTime ? (
                      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, lineHeight: 19, color: c.textPrimary, textAlign: "right" }}>{shownTime}</Text>
                    ) : null}
                    {m.costShort ? (
                      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 13, lineHeight: 18, color: c.gold, textAlign: "right" }}>{m.costShort}</Text>
                    ) : null}
                  </View>
                  {open ? <ChevronUp color={c.gold} size={22} /> : <ChevronDown color={c.textMuted} size={22} />}
                </View>
                {hasBadges ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6, marginLeft: 56 }}>
                    {m.fastest ? <Badge text="Fastest" color={c.success} /> : null}
                    {m.cheapest ? <Badge text="Cheapest" color={c.success} /> : null}
                    {m.bookAhead ? <Badge text="Book ahead" color={c.warning} /> : null}
                  </View>
                ) : null}
              </Pressable>

              {open ? <Journey mode={m} placeName={placeName} origin={originCity && m.departure ? { city: originShort, fromLocation: originSource === "gps" } : null} /> : null}
            </View>
          );
        })}
      </View>
        </>
      )}

      {sight ? (
        // Keyed by the start city and the lookup state so it is laid out afresh when the rows above it change
        // (on iPhone its last line was left clipped after the "From" chip appeared).
        <View key={`sights-${originCity}-${estimateState}`} style={{ marginHorizontal: 16, marginTop: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: withOpacity(c.teal, 0.3), backgroundColor: withOpacity(c.teal, 0.08) }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Compass color={c.teal} size={18} />
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14.5, lineHeight: 21, color: c.teal }}>From there to the sights</Text>
          </View>
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 22, color: c.textPrimary }}>{sight}</Text>
        </View>
      ) : null}

      {local.length > 0 ? (
        <>
          <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 17, lineHeight: 24, color: c.textPrimary, paddingHorizontal: 20, marginTop: 22, marginBottom: 8 }}>
            Getting around once you're there
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16 }}>
            {local.map((l) => {
              const Icon = LOCAL_ICON[l.icon];
              return (
                <View key={l.key} style={{ width: tileWidth, minHeight: 84, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: c.borderSoft, backgroundColor: c.surfaceAlt }}>
                  <Icon color={c.gold} size={20} />
                  <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 13.5, lineHeight: 19, color: c.textPrimary, marginTop: 6 }}>{l.mode}</Text>
                  {l.cost ? (
                    <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 13.5, lineHeight: 19, color: c.gold }}>{l.cost}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary, paddingHorizontal: 20, marginTop: 8 }}>
            Fares are typical. Agree the price before you get in.
          </Text>
        </>
      ) : null}

      {originCity ? (
        <>
          <Pressable
            onPress={onOpenPlanner}
            accessibilityRole="button"
            accessibilityLabel={`See the full route from ${originShort} to ${placeName}`}
            android_ripple={{ color: withOpacity(c.onPrimary, 0.2) }}
            style={{
              marginHorizontal: 16, marginTop: 14, minHeight: 52, borderRadius: 12, backgroundColor: c.primary,
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8,
            }}
          >
            <Route color={c.onPrimary} size={19} />
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14.5, lineHeight: 20, color: c.onPrimary }}>See the full route from {originShort}</Text>
          </Pressable>
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary, paddingHorizontal: 20, marginTop: 6 }}>
            Add stops along the way and see more options.
          </Text>
        </>
      ) : null}

      {pickerOpen ? (
        <OriginPicker
          visible
          onClose={() => setPickerOpen(false)}
          onPick={choose}
          onUseLocation={() => void useMyLocation()}
          detecting={locating}
          notice={notice}
          permission={permission}
          recents={recentOrigins}
        />
      ) : null}
    </View>
  );
}

/** The opened row: a short journey line, the tip, and the steps from the arrival point to a stay. */
function Journey({ mode: m, placeName, origin }: { mode: PersonalMode; placeName: string; origin: { city: string; fromLocation: boolean } | null }) {
  const c = useThemeColors();
  const dot = (shape: "round" | "square", color: string) => (
    <View style={{ position: "absolute", left: -26, top: 3, width: 14, height: 14, borderRadius: shape === "round" ? 7 : 3, backgroundColor: color }} />
  );
  const timeText = origin && m.departure ? m.personalTime : m.duration;
  const showTime = !!(timeText || m.cost);
  return (
    <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
      {showTime || m.arrivalName ? (
        <View style={{ marginLeft: 22, borderLeftWidth: 2, borderLeftColor: withOpacity(c.gold, 0.3), paddingLeft: 18, gap: 12 }}>
          {origin ? (
            <View>
              {dot("round", c.textPrimary)}
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12.5, lineHeight: 17, color: c.textSecondary }}>You start in</Text>
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, lineHeight: 20, color: c.textPrimary }}>
                {origin.city}
                {origin.fromLocation && origin.city !== "Your location" ? <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary }}>  · your location</Text> : null}
              </Text>
            </View>
          ) : null}
          {origin && m.departure ? (
            <View>
              {dot("square", c.gold)}
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12.5, lineHeight: 17, color: c.textSecondary }}>Leave from</Text>
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, lineHeight: 20, color: c.textPrimary }}>{m.departure.name}</Text>
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary }}>{m.departure.distance}</Text>
              <Pressable
                onPress={() => {
                  const place = m.departure!.name.replace(/\s*\(.*\)\s*$/, "");
                  // Started from the phone's position: directions from where you are, not a search near a city.
                  if (origin.fromLocation) void openMapDirections(place);
                  else void openMapSearch(`${place}, ${origin.city}`);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Directions to ${m.departure.name}. Opens your maps app.`}
                android_ripple={{ color: withOpacity(c.primary, 0.14) }}
                style={{
                  alignSelf: "flex-start", marginTop: 8, minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1.5, borderColor: c.border,
                  flexDirection: "row", alignItems: "center", gap: 6,
                }}
              >
                <Navigation color={c.gold} size={16} />
                <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 13, lineHeight: 18, color: c.textPrimary }}>Directions</Text>
              </Pressable>
            </View>
          ) : null}
          {showTime ? (
            <View>
              {dot("round", c.gold)}
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 20, color: c.textPrimary }}>
                <Text style={{ fontFamily: "Poppins_700Bold" }}>{m.label}</Text>
                {timeText ? ` · ${timeText}` : ""}
                {m.cost ? <Text>{" · "}<Text style={{ fontFamily: "Poppins_700Bold", color: c.gold }}>{m.cost}</Text></Text> : null}
              </Text>
            </View>
          ) : null}
          {m.arrivalName ? (
            <View>
              {dot("square", c.teal)}
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12.5, lineHeight: 17, color: c.textSecondary }}>Arrive at</Text>
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, lineHeight: 20, color: c.textPrimary }}>{m.arrivalName}</Text>
              {m.arrivalDistance ? (
                <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary }}>{m.arrivalDistance}</Text>
              ) : null}
              <Pressable
                onPress={() => openMapSearch(`${m.arrivalName.split(/ — /)[0]}, ${placeName}`)}
                accessibilityRole="button"
                accessibilityLabel={`Directions to ${m.arrivalName}. Opens your maps app.`}
                android_ripple={{ color: withOpacity(c.primary, 0.14) }}
                style={{
                  alignSelf: "flex-start", marginTop: 8, minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1.5, borderColor: c.border,
                  flexDirection: "row", alignItems: "center", gap: 6,
                }}
              >
                <Navigation color={c.gold} size={16} />
                <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 13, lineHeight: 18, color: c.textPrimary }}>Directions</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}

      {m.tip ? (
        <View style={{ marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: withOpacity(c.gold, 0.1) }}>
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20, color: c.textPrimary }}>{m.tip}</Text>
        </View>
      ) : null}

      {m.steps.length > 0 ? (
        <View style={{ marginTop: 12 }}>
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 12.5, lineHeight: 18, color: c.textSecondary, marginBottom: 6 }}>
            From {STEP_HEAD[m.kind]} to your stay
          </Text>
          {m.steps.map((s, i) => {
            const Icon = STEP_ICON[s.icon];
            return (
              <View key={`${i}-${s.action}`} style={{ flexDirection: "row", gap: 10, paddingVertical: 7, borderTopWidth: i ? 1 : 0, borderTopColor: c.borderSoft }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
                  <Icon color={c.textSecondary} size={15} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 20, color: c.textPrimary }}>{s.action}</Text>
                  {s.cost || s.duration ? (
                    <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary }}>
                      <Text style={{ fontFamily: "Poppins_700Bold", color: c.gold }}>{s.cost}</Text>
                      {s.cost && s.duration ? " · " : ""}
                      {s.duration}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
