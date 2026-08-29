/** Source of truth: Figma "2.2 Generated Itinerary — Timeline". */
import { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Train, Home, Navigation, ChevronDown, ChevronUp, Download } from "lucide-react-native";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";
import type { TripPlan } from "../data";
import { exportItineraryPdf } from "../exportPdf";

interface Props {
  plan: TripPlan;
  onBack?: () => void;
  onRebuild: () => void;
  /** See ChatStep's doc comment — height of the floating tab bar, 0 if none. */
  tabBarHeight?: number;
}

const DAY_BADGE = "#4A1F35";
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDateLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${WEEKDAY_SHORT[d.getDay()]}, ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
}

export default function ResultStep({ plan, onBack, onRebuild, tabBarHeight = 0 }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [exporting, setExporting] = useState(false);
  const perPersonPerDay = Math.round(plan.totalCost / plan.days / plan.people);
  const foodPerPersonPerDay = Math.round(plan.foodBudget / plan.days / plan.people);
  const isMultiLeg = !!plan.legs && plan.legs.length > 1;
  const routeLabel = isMultiLeg ? plan.legs!.map((l) => l.destination.name).join(" → ") : plan.destination.name;

  const handleDownload = async () => {
    if (exporting) return;
    setExporting(true);
    const result = await exportItineraryPdf(plan);
    setExporting(false);
    if (!result.ok && result.error) Alert.alert("Couldn't share itinerary", result.error);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: insets.top + 8, paddingBottom: 8 }}>
        {/* Always present — previously only showed when this screen was
            opened as a modal (onBack provided). Reached via the Plan tab
            (no onBack), there was no way back at all once a plan was
            generated except the small "Rebuild" pill. Falls back to
            returning to the form when there's no caller to pop back to. */}
        <Pressable onPress={onBack ?? onRebuild} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft color={c.textPrimary} size={18} />
        </Pressable>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 18, color: c.textPrimary, flex: 1 }}>Your Travel Plan</Text>
        <Pressable
          onPress={handleDownload}
          disabled={exporting}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center", opacity: exporting ? 0.6 : 1 }}
        >
          {exporting ? <ActivityIndicator size="small" color={c.textPrimary} /> : <Download color={c.textPrimary} size={16} />}
        </Pressable>
        <Pressable onPress={onRebuild} style={{ backgroundColor: c.surfaceAlt, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.textPrimary }}>Rebuild</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 20, paddingBottom: 40 + (tabBarHeight > 0 ? tabBarHeight + 12 : insets.bottom) }} showsVerticalScrollIndicator={false}>
        {/* Grouped in one View, not two ScrollView siblings — the parent's
            gap: 20 is meant to separate whole blocks (this from the
            gradient card below), not these two closely-related lines. */}
        <View style={{ gap: 2 }}>
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary }}>
            {plan.origin} → {routeLabel} · {plan.days} days · {plan.styleConfig.label}
          </Text>
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary }}>
            📅 {plan.startDate ? formatDateLabel(plan.startDate) : "Flexible dates"}
          </Text>
        </View>

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
                    </View>
                  )}
                </Pressable>
                </View>
              );
            })}
          </View>
        </View>

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
