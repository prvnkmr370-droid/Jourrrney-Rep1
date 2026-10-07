/** Source of truth: Figma "2.2 Generated Itinerary — Timeline". */
import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Train, Home, Navigation, ChevronDown, ChevronUp, ChevronRight, Download, MapPin, Search, ShieldCheck, Heart, Car } from "lucide-react-native";
import DestImage from "@/components/DestImage";
import { getTabBarFootprint } from "@/components/BottomTabBar";
import { withOpacity } from "@/components/withOpacity";
import type { Destination } from "@/data/destinations";
import { fetchRouteInfo } from "@/screens/DestinationDetail/tabs/how-to-reach/routeInfo";
import { useSavedTripsStore } from "@/store/useSavedTripsStore";
import { useThemeColors } from "@/theme/useThemeColors";
import type { PlanStop, TripPlan } from "../data";
import { exportItineraryPdf } from "../exportPdf";
import { MAX_TRIP_DAYS } from "../parseTripMessage";
import type { PlanTweak, TweakNote } from "../PlanTrip";
import { holdPlanSession } from "../planSession";

interface Props {
  plan: TripPlan;
  onBack?: () => void;
  /** Start the chat over. Not used when viewing a saved trip. */
  onRebuild?: () => void;
  /** One-tap changes under the day list. Omitted when viewing a saved trip. */
  onTweak?: (tweak: PlanTweak) => void;
  /** Set right after a tweak rebuilt the plan — shows what changed, with Undo. */
  tweakNote?: TweakNote | null;
  onUndoTweak?: () => void;
  /** See ChatStep's doc comment — height of the floating tab bar, 0 if none. */
  tabBarHeight?: number;
  /** A trip reopened from My trips: no tweaking or restarting, and the Save
   * button becomes "Remove". */
  savedTripId?: string;
}

const DAY_BADGE = "#4A1F35";
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDateLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${WEEKDAY_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
}

export default function ResultStep({ plan, onBack, onRebuild, onTweak, tweakNote, onUndoTweak, tabBarHeight = 0, savedTripId }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [exporting, setExporting] = useState(false);
  const readOnly = !!savedTripId;
  const perPersonPerDay = Math.round(plan.totalCost / plan.days / plan.people);
  const foodPerPersonPerDay = Math.round(plan.foodBudget / plan.days / plan.people);
  const isMultiLeg = !!plan.legs && plan.legs.length > 1;
  const routeLabel = isMultiLeg ? plan.legs!.map((l) => l.destination.name).join(" → ") : plan.destination.name;
  const tripDestinations: Destination[] = isMultiLeg ? plan.legs!.map((l) => l.destination) : [plan.destination];

  // Saving: a plan opened from My trips is already saved (its id is the saved
  // id); a fresh plan becomes saved when the traveller taps Save.
  const saveTrip = useSavedTripsStore((st) => st.save);
  const removeTrip = useSavedTripsStore((st) => st.remove);
  const [savedId, setSavedId] = useState<string | null>(savedTripId ?? null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);
  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const handleSaveToggle = () => {
    if (savedId) {
      removeTrip(savedId);
      setSavedId(null);
      showToast("Removed from My trips");
      // Reopened from My trips and just removed: nothing left to show here.
      if (readOnly) onBack?.();
    } else {
      setSavedId(saveTrip(plan));
      showToast("Saved to My trips");
    }
  };

  const handleDownload = async () => {
    if (exporting) return;
    setExporting(true);
    const result = await exportItineraryPdf(plan);
    setExporting(false);
    if (!result.ok && result.error) Alert.alert("Couldn't share itinerary", result.error);
  };

  // The sticky bar floats above the tab bar when there is one, else above the
  // home indicator; the scroll content leaves room for it.
  const barBottom = tabBarHeight > 0 ? getTabBarFootprint(insets.bottom) + 8 : Math.max(insets.bottom, 12);
  const BAR_HEIGHT = 64;
  const heroImage = plan.destination.heroImage || plan.destination.image;
  const dateLabel = plan.startDate ? formatDateLabel(plan.startDate) : "Flexible dates";

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: insets.top + 8, paddingBottom: 8 }}>
        {/* Always present — reached via the Plan tab (no onBack) it falls back
            to returning to the form when there's no caller to pop back to. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack ?? onRebuild}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}
        >
          <ArrowLeft color={c.textPrimary} size={18} />
        </Pressable>
        {/* Inside the tabs the floating profile pill sits over the header's
            right edge, so reserve room for it (same as the chat header). PDF
            and Rebuild used to live up here, where the pill covered them —
            they now sit in the bottom bar and the "Tweak this plan" row. */}
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 18, color: c.textPrimary, flex: 1, paddingRight: tabBarHeight > 0 ? 84 : 0 }}>
          {readOnly ? "Saved trip" : "Your Travel Plan"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 20, paddingBottom: barBottom + BAR_HEIGHT + 28 }} showsVerticalScrollIndicator={false}>
        {tweakNote && (
          <View
            accessibilityLiveRegion="polite"
            style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: withOpacity(c.teal, 0.12), borderWidth: 1, borderColor: withOpacity(c.teal, 0.45), borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 }}
          >
            <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, lineHeight: 17, color: c.textPrimary, flex: 1 }}>
              ✓ Updated: {tweakNote.label} · ₹{plan.totalCost.toLocaleString("en-IN")} total
              {tweakNote.previous.totalCost !== plan.totalCost ? ` (was ₹${tweakNote.previous.totalCost.toLocaleString("en-IN")})` : ""}
            </Text>
            {onUndoTweak && (
              <Pressable accessibilityRole="button" onPress={onUndoTweak} hitSlop={8}>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.teal }}>Undo</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Destination photo with the trip summary over it. */}
        <View>
          <View style={{ height: 200, borderRadius: 20, overflow: "hidden", backgroundColor: c.surfaceAlt }}>
            {heroImage ? <DestImage source={{ uri: heroImage }} contentFit="cover" style={StyleSheet.absoluteFill} /> : null}
            <LinearGradient colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.8)"]} locations={[0.3, 1]} style={StyleSheet.absoluteFill} />
            <View style={{ flex: 1, justifyContent: "flex-end", padding: 16 }}>
              <Text numberOfLines={2} style={{ fontFamily: "Poppins_800ExtraBold", fontSize: 26, lineHeight: 31, color: "#FFFFFF" }}>
                {routeLabel}
              </Text>
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: "rgba(255,255,255,0.88)", marginTop: 2 }}>
                {isMultiLeg ? `${plan.legs!.length} stops` : plan.destination.state} · {plan.days} day{plan.days === 1 ? "" : "s"} · {plan.people} traveller{plan.people === 1 ? "" : "s"}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                <HeroPill label={plan.styleConfig.label} />
                <HeroPill label={`📅 ${dateLabel}`} />
              </View>
            </View>
          </View>
          {/* Required attribution for Creative Commons photos, same line the
              destination page shows under its own hero. */}
          {plan.destination.imageCredit ? (
            <Text numberOfLines={2} style={{ fontFamily: "Poppins_400Regular", fontSize: 9.5, color: c.textMuted, marginTop: 4 }}>
              {plan.destination.imageCredit}
            </Text>
          ) : null}
        </View>

        {plan.origin ? <RouteStrip origin={plan.origin} destinations={tripDestinations} live={!readOnly} c={c} /> : null}

        {tripDestinations.map((dest) => (
          <SafetyCard key={dest.id} dest={dest} showName={isMultiLeg} c={c} />
        ))}

        {/* Summary gradient card */}
        <LinearGradient
          colors={["#333C81", "#C44A0A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 20, padding: 20 }}
        >
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: "#FFFFFF" }}>{plan.styleConfig.label}</Text>
          {/* Multi-leg trips show each stop's own day count on its own
              line ("3 days in Mysore", "2 days in Coorg") rather than one
              flat "5 days · N people · Mysore" line that would silently
              drop every stop after the first. */}
          {isMultiLeg ? (
            <View style={{ marginTop: 4, gap: 2 }}>
              {plan.legs!.map((leg) => (
                <Text key={leg.destination.id} style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
                  {leg.days} day{leg.days === 1 ? "" : "s"} in {leg.destination.name}
                </Text>
              ))}
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: "rgba(255,255,255,0.75)" }}>{plan.people} people</Text>
            </View>
          ) : (
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>
              {plan.days} days · {plan.people} people · {plan.destination.name}
            </Text>
          )}
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 28, color: "#FFFFFF", marginTop: 12 }}>
            ₹{plan.totalCost.toLocaleString("en-IN")} total
          </Text>
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
            ≈ ₹{perPersonPerDay.toLocaleString("en-IN")}/person/day
          </Text>
        </LinearGradient>

        {/* Travel breakdown */}
        <View>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary, marginBottom: 12 }}>Your Travel Breakdown</Text>
          <View style={{ gap: 10 }}>
            <BreakdownRow icon={Train} label="Getting There" value={plan.styleConfig.transport} c={c} />
            <BreakdownRow icon={Home} label="Where to Stay" value={plan.styleConfig.stay} c={c} />
            <BreakdownRow icon={Navigation} label="Getting Around" value={plan.styleConfig.local} c={c} />
            <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 14 }}>
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: c.textSecondary, marginBottom: 4 }}>Food Budget</Text>
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary }}>₹{plan.foodBudget.toLocaleString("en-IN")} total</Text>
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>₹{foodPerPersonPerDay.toLocaleString("en-IN")}/person/day</Text>
            </View>
          </View>
        </View>

        {/* Booking checklist */}
        <View style={{ backgroundColor: withOpacity(c.primary, 0.08), borderWidth: 1.5, borderColor: c.primary, borderRadius: 16, padding: 16 }}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.primary, marginBottom: 10 }}>Booking Checklist</Text>
          <View style={{ gap: 10 }}>
            {plan.bookingChecklist.slice(0, 3).map((tip, i) => (
              <View key={tip} style={{ flexDirection: "row", gap: 8 }}>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.primary }}>{i + 1}.</Text>
                <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textPrimary, flex: 1 }}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Day by day */}
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 17, color: c.textPrimary }}>Day-by-Day Plan</Text>
            {/* Only shown when the itinerary genuinely came from Gemini
                (see planSource in data.ts) — never claimed when it's
                actually the local rule-based fallback, so "AI-generated"
                stays an honest label rather than permanent marketing
                copy regardless of what actually produced the plan. */}
            {plan.planSource === "ai" && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: withOpacity(c.gold, 0.15), borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontSize: 10 }}>✨</Text>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 10, color: c.gold }}>AI-generated</Text>
              </View>
            )}
          </View>
          <View style={{ gap: 10 }}>
            {plan.itinerary.map((day, i) => {
              const expanded = expandedDay === i;
              // Multi-leg trips insert a small divider header right before
              // the first day of each new leg ("📍 Coorg — Days 4-6") so the
              // list visually reads as stops in sequence rather than one
              // undifferentiated block of days. Detected by comparing to
              // the previous day's leg name rather than precomputing leg
              // boundaries up front, since itinerary is already a flat
              // day array by the time it reaches this component.
              const prevLeg = i > 0 ? plan.itinerary[i - 1].legDestinationName : undefined;
              const isNewLeg = isMultiLeg && day.legDestinationName && day.legDestinationName !== prevLeg;
              const legDays = isNewLeg ? plan.legs!.find((l) => l.destination.name === day.legDestinationName) : undefined;
              return (
                <View key={day.day}>
                  {isNewLeg && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10, marginTop: i > 0 ? 4 : 0 }}>
                      <Text style={{ fontSize: 13 }}>📍</Text>
                      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>
                        {day.legDestinationName}
                        {legDays ? ` — Day${legDays.endDay - legDays.startDay === 0 ? "" : "s"} ${legDays.startDay}-${legDays.endDay}` : ""}
                      </Text>
                    </View>
                  )}
                <Pressable
                  onPress={() => setExpandedDay(expanded ? null : i)}
                  style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 14 }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: DAY_BADGE, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: "#FFFFFF" }}>{day.day}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>{day.title}</Text>
                      <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: c.teal, marginTop: 2 }}>
                        Est. ₹{day.estimatedCost.toLocaleString("en-IN")}
                      </Text>
                    </View>
                    {expanded ? <ChevronUp color={c.textMuted} size={16} /> : <ChevronDown color={c.textMuted} size={16} />}
                  </View>

                  {expanded && (
                    <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border, gap: 8 }}>
                      <DayPart label="Morning" text={day.morning} c={c} />
                      <DayPart label="Afternoon" text={day.afternoon} c={c} />
                      <DayPart label="Evening" text={day.evening} c={c} />
                      {day.stops && day.stops.length > 0 && (
                        <View style={{ gap: 8, marginTop: 4 }}>
                          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 10.5, letterSpacing: 0.6, color: c.teal }}>STOPS ON THIS DAY</Text>
                          {day.stops.map((stop) => (
                            <StopCard key={`${stop.kind}-${stop.destId ?? stop.name}`} stop={stop} c={c} />
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </Pressable>
                </View>
              );
            })}
          </View>
        </View>

        {!readOnly && onTweak && onRebuild && <TweakSection plan={plan} onTweak={onTweak} onRebuild={onRebuild} c={c} />}

        {/* Smart tips */}
        <View>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 17, color: c.textPrimary, marginBottom: 12 }}>Smart Tips</Text>
          <View style={{ gap: 10 }}>
            {plan.tips.map((tip) => (
              <View key={tip} style={{ backgroundColor: withOpacity(c.gold, 0.1), borderWidth: 1, borderColor: withOpacity(c.gold, 0.35), borderRadius: 14, padding: 12 }}>
                <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textPrimary }}>💡 {tip}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {toast && (
        <View
          accessibilityLiveRegion="polite"
          pointerEvents="none"
          style={{ position: "absolute", left: 0, right: 0, bottom: barBottom + BAR_HEIGHT + 10, alignItems: "center" }}
        >
          <View style={{ backgroundColor: withOpacity(c.teal, 0.95), borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 }}>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: "#06323A" }}>{toast}</Text>
          </View>
        </View>
      )}

      {/* Total always in view, with the two things worth doing with a plan. */}
      <View
        style={{
          position: "absolute", left: 14, right: 14, bottom: barBottom, minHeight: BAR_HEIGHT,
          flexDirection: "row", alignItems: "center", gap: 8,
          backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 18,
          paddingHorizontal: 14, paddingVertical: 10,
          shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: -4 }, elevation: 8,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Poppins_800ExtraBold", fontSize: 15, color: c.textPrimary }}>₹{plan.totalCost.toLocaleString("en-IN")} total</Text>
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10.5, color: c.textSecondary }}>≈ ₹{perPersonPerDay.toLocaleString("en-IN")}/person/day</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={savedId ? "Remove this trip from My trips" : "Save this trip to My trips"}
          onPress={handleSaveToggle}
          style={{
            flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9,
            backgroundColor: savedId ? withOpacity(c.teal, 0.15) : "#333C81", borderWidth: 1, borderColor: savedId ? c.teal : "#333C81",
          }}
        >
          <Heart color={savedId ? c.teal : "#FFFFFF"} fill={savedId ? c.teal : "transparent"} size={14} />
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: savedId ? c.teal : "#FFFFFF" }}>{savedId ? "Saved" : "Save trip"}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Download itinerary as PDF"
          onPress={handleDownload}
          disabled={exporting}
          style={{ flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: c.primary, opacity: exporting ? 0.6 : 1 }}
        >
          {exporting ? <ActivityIndicator size="small" color={c.primary} /> : <Download color={c.primary} size={14} />}
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.primary }}>PDF</Text>
        </Pressable>
      </View>
    </View>
  );
}

function BreakdownRow({ icon: Icon, label, value, c }: { icon: typeof Train; label: string; value: string; c: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 14 }}>
      <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: withOpacity(c.teal, 0.12), alignItems: "center", justifyContent: "center" }}>
        <Icon color={c.teal} size={16} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: c.textSecondary }}>{label}</Text>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary, marginTop: 2 }}>{value}</Text>
      </View>
    </View>
  );
}

function DayPart({ label, text, c }: { label: string; text: string; c: ReturnType<typeof useThemeColors> }) {
  return (
    <View>
      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.teal, marginBottom: 2 }}>{label}</Text>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textSecondary }}>{text}</Text>
    </View>
  );
}

/** One stop under a day. Three looks, matching what we actually know:
 * a destination card (photo, safety score, opens that card), a place from the
 * destination's own lists (text only), or an AI-added place we have no record
 * of — shown dashed and labelled so it isn't mistaken for something verified. */
function StopCard({ stop, c }: { stop: PlanStop; c: ReturnType<typeof useThemeColors> }) {
  const meta = [stop.type, stop.distance].filter(Boolean).join(" · ");

  if (stop.kind === "card" && stop.destId) {
    const destId = stop.destId;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${stop.name}. Open destination guide.`}
        onPress={() => {
          // Plan My Trip opened from a card resets when it loses focus; this
          // is a quick look at a stop, so keep the plan (see planSession.ts).
          holdPlanSession();
          router.push(`/destination/${destId}`);
        }}
        style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: withOpacity(c.teal, 0.5), borderRadius: 14, padding: 8 }}
      >
        {stop.image ? (
          <DestImage source={{ uri: stop.image }} contentFit="cover" style={{ width: 54, height: 54, borderRadius: 10 }} />
        ) : (
          <StopIcon c={c}>
            <MapPin color={c.teal} size={20} />
          </StopIcon>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12.5, lineHeight: 17, color: c.textPrimary }}>{stop.name}</Text>
          {meta ? <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10.5, color: c.textSecondary, marginTop: 1 }}>{meta}</Text> : null}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 5 }}>
            <Badge label="In our guide" color={c.teal} />
            {typeof stop.safetyScore === "number" ? <Badge label={`Safety ${stop.safetyScore}/10`} color={c.textSecondary} /> : null}
          </View>
        </View>
        <ChevronRight color={c.primary} size={18} />
      </Pressable>
    );
  }

  if (stop.kind === "listed") {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.border, borderRadius: 14, padding: 8 }}>
        <StopIcon c={c}>
          <MapPin color={c.teal} size={20} />
        </StopIcon>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12.5, lineHeight: 17, color: c.textPrimary }}>{stop.name}</Text>
          {meta ? <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10.5, color: c.textSecondary, marginTop: 1 }}>{meta}</Text> : null}
          <View style={{ flexDirection: "row", marginTop: 5 }}>
            <Badge label="In our guide" color={c.teal} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surface, borderWidth: 1, borderStyle: "dashed", borderColor: withOpacity(c.gold, 0.7), borderRadius: 14, padding: 8 }}>
      <StopIcon c={c}>
        <Search color={c.gold} size={20} />
      </StopIcon>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12.5, lineHeight: 17, color: c.textPrimary }}>{stop.name}</Text>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10.5, color: c.textSecondary, marginTop: 1 }}>Not in our guide yet — confirm timings before you go</Text>
        <View style={{ flexDirection: "row", marginTop: 5 }}>
          <Badge label="Check locally" color={c.gold} />
        </View>
      </View>
    </View>
  );
}

function StopIcon({ c, children }: { c: ReturnType<typeof useThemeColors>; children: React.ReactNode }) {
  return <View style={{ width: 54, height: 54, borderRadius: 10, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>{children}</View>;
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ backgroundColor: withOpacity(color, 0.15), borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 9.5, color }}>{label}</Text>
    </View>
  );
}

function HeroPill({ label }: { label: string }) {
  return (
    <View style={{ backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 10.5, color: "#FFFFFF" }}>{label}</Text>
    </View>
  );
}

// Distance/time per origin + destination pair, kept for the session so a
// tweak (which rebuilds this screen) doesn't ask the backend the same thing again.
const routeSummaryCache = new Map<string, string | null>();

/** "Bangalore ——🚗—— Coorg" with the distance and travel times underneath.
 * The names appear straight away; the numbers come from the same route lookup
 * How to Reach uses and are simply left out if it can't answer. */
function RouteStrip({ origin, destinations, live, c }: { origin: string; destinations: Destination[]; live: boolean; c: ReturnType<typeof useThemeColors> }) {
  const single = destinations.length === 1 ? destinations[0] : null;
  const cacheKey = single ? `${origin.toLowerCase()}|${single.id}` : "";
  const [summary, setSummary] = useState<string | null | undefined>(() => (cacheKey ? routeSummaryCache.get(cacheKey) : null));

  useEffect(() => {
    // Only a single-destination plan has one clear "distance"; a saved trip
    // doesn't phone the backend just to be viewed again.
    if (!single || !live || routeSummaryCache.has(cacheKey)) return;
    let cancelled = false;
    fetchRouteInfo(origin, { name: single.name, state: single.state }).then((info) => {
      // Distance plus the road time only: road works from any start city, while
      // flight/train options depend on airports and stations the AI can get wrong
      // (those stay on the How to Reach tab, where the traveller can inspect them).
      const road = info?.transport.find((t) => /road|drive|car/i.test(t.mode) && t.duration);
      const text = info ? `~${Math.round(info.distanceKm).toLocaleString("en-IN")} km${road ? ` · ${road.mode} ${road.duration}` : ""}` : null;
      // Only remember a real answer — a failed lookup should be retried next time.
      if (text) routeSummaryCache.set(cacheKey, text);
      if (!cancelled) setSummary(text);
    });
    return () => {
      cancelled = true;
    };
  }, [origin, single, live, cacheKey]);

  const names = [origin, ...destinations.map((d) => d.name)];
  return (
    <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text numberOfLines={1} style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary, flexShrink: 1 }}>{names[0]}</Text>
        <View style={{ flex: 1, minWidth: 24, flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View style={{ flex: 1, borderTopWidth: 2, borderStyle: "dashed", borderColor: withOpacity(c.primary, 0.6) }} />
          <Car color={c.primary} size={15} />
          <View style={{ flex: 1, borderTopWidth: 2, borderStyle: "dashed", borderColor: withOpacity(c.primary, 0.6) }} />
        </View>
        <Text numberOfLines={2} style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary, flexShrink: 1, textAlign: "right" }}>
          {names.slice(1).join(" → ")}
        </Text>
      </View>
      {single && live && summary === undefined ? (
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textMuted }}>Checking the route…</Text>
      ) : summary ? (
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, lineHeight: 16, color: c.textSecondary }}>{summary} (approximate)</Text>
      ) : null}
    </View>
  );
}

/** The destination's own women's-safety rating and the few facts that matter
 * most before leaving — read straight from the destination's data. */
function SafetyCard({ dest, showName, c }: { dest: Destination; showName: boolean; c: ReturnType<typeof useThemeColors> }) {
  const ws = dest.womenSafety;
  const stayIn = ws.safeZones.slice(0, 2).join(", ");
  const avoid = ws.avoidAreas[0];
  const helpline = ws.emergencyContacts.find((e) => /women/i.test(e.label)) ?? ws.emergencyContacts[0];
  const emergency = ws.emergencyContacts.find((e) => e.number === "112");
  const help = [helpline, emergency && emergency !== helpline ? emergency : null].filter((e): e is { label: string; number: string } => !!e).map((e) => `${e.label} ${e.number}`).join(" · ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${dest.name} safety details`}
      onPress={() => {
        holdPlanSession();
        router.push(`/safety/${dest.id}`);
      }}
      style={{ backgroundColor: withOpacity(c.teal, 0.09), borderWidth: 1, borderColor: withOpacity(c.teal, 0.55), borderRadius: 16, padding: 14, gap: 6 }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <ShieldCheck color={c.teal} size={17} />
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13.5, color: c.textPrimary, flex: 1 }}>
          {showName ? `${dest.name}: ` : ""}Safety {ws.score}/10 · {ws.level}
        </Text>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.teal }}>Details ›</Text>
      </View>
      {stayIn ? <SafetyLine label="Stay in" text={stayIn} c={c} /> : null}
      {avoid ? <SafetyLine label="Avoid" text={avoid} c={c} /> : null}
      {help ? <SafetyLine label="Help" text={help} c={c} /> : null}
    </Pressable>
  );
}

function SafetyLine({ label, text, c }: { label: string; text: string; c: ReturnType<typeof useThemeColors> }) {
  return (
    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textPrimary }}>
      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.teal }}>{label}  </Text>
      {text}
    </Text>
  );
}

// Interest tweaks offered when the plan doesn't already include them.
const INTEREST_TWEAKS = [
  { id: "food", label: "🍛 More food" },
  { id: "adventure", label: "🧗 More adventure" },
  { id: "nature", label: "🌿 More nature" },
  { id: "heritage", label: "🛕 More heritage" },
];
const PEOPLE_CHOICES = [1, 2, 3, 4];

/** "Tweak this plan": one-tap changes that rebuild the same trip, instead of
 * the all-or-nothing restart. */
function TweakSection({ plan, onTweak, onRebuild, c }: { plan: TripPlan; onTweak: (t: PlanTweak) => void; onRebuild: () => void; c: ReturnType<typeof useThemeColors> }) {
  const [choosingPeople, setChoosingPeople] = useState(false);
  const isMultiLeg = !!plan.legs && plan.legs.length > 1;
  const chips: { key: string; label: string; onPress: () => void }[] = [];

  if (plan.style !== "backpacker") chips.push({ key: "cheaper", label: "💸 Make it cheaper", onPress: () => onTweak({ kind: "cheaper" }) });
  // Which stop an extra day belongs to is ambiguous on a multi-stop trip.
  if (!isMultiLeg && plan.days < MAX_TRIP_DAYS) chips.push({ key: "addDay", label: "➕ Add a day", onPress: () => onTweak({ kind: "addDay" }) });
  for (const it of INTEREST_TWEAKS) {
    if (!plan.preferences.includes(it.id)) chips.push({ key: it.id, label: it.label, onPress: () => onTweak({ kind: "interest", id: it.id }) });
  }
  chips.push({ key: "people", label: "👥 Change travellers", onPress: () => setChoosingPeople((v) => !v) });
  chips.push({ key: "restart", label: "🔄 Start over", onPress: onRebuild });

  return (
    <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 14, gap: 10 }}>
      <View>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary }}>Tweak this plan</Text>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11.5, color: c.textSecondary, marginTop: 2 }}>
          Rebuilds the same trip with one change — no need to start over.
        </Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {chips.map((chip) => (
          <TweakChip key={chip.key} label={chip.label} onPress={chip.onPress} active={chip.key === "people" && choosingPeople} c={c} />
        ))}
      </View>
      {choosingPeople && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11.5, color: c.textSecondary }}>Travellers:</Text>
          {PEOPLE_CHOICES.filter((n) => n !== plan.people).map((n) => (
            <TweakChip
              key={n}
              label={n === 4 ? "4+" : String(n)}
              onPress={() => {
                setChoosingPeople(false);
                onTweak({ kind: "people", count: n });
              }}
              c={c}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function TweakChip({ label, onPress, active = false, c }: { label: string; onPress: () => void; active?: boolean; c: ReturnType<typeof useThemeColors> }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        paddingHorizontal: 13, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, borderColor: c.primary,
        backgroundColor: active ? withOpacity(c.primary, 0.22) : withOpacity(c.primary, 0.1),
      }}
    >
      <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, color: c.primary }}>{label}</Text>
    </Pressable>
  );
}
