/**
 * "A day at <place>" on the destination's home page: the ready-made plan that
 * used to be the Day plan tab, as open-and-close cards. Most places (89%) have
 * one day, so one card shows; a place with a longer plan shows Day 1 with a
 * "Show all N days" button. "Plan my own with AI" sits inside every opened day
 * and goes straight to the AI planner.
 */
import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronDown, ChevronUp, Sparkles, Sunrise, Sun, Moon, type LucideIcon } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";

const MAX_FONT = 1.3;

export default function DayPlanCard({ destination: d, onPlanTrip }: { destination: Destination; onPlanTrip: () => void }) {
  const c = useThemeColors();
  const placeName = d.name.replace(/\s*\([^)]*\)/g, "").trim();
  const days = d.defaultItinerary;
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  if (days.length === 0) return null;
  const visible = showAll ? days : days.slice(0, 1);

  return (
    <View style={{ marginTop: 24 }}>
      <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 20, lineHeight: 27, color: c.textPrimary, paddingHorizontal: 20, marginBottom: 8 }}>
        {days.length === 1 ? `A day at ${placeName}` : `A ready-made ${days.length}-day plan`}
      </Text>
      <View style={{ gap: 10, paddingHorizontal: 16 }}>
        {visible.map((day, i) => {
          const isOpen = openDay === i;
          return (
            <View
              key={day.day}
              style={{ backgroundColor: c.surfaceAlt, borderRadius: 16, borderWidth: isOpen ? 1.5 : 1, borderColor: isOpen ? c.primary : c.borderSoft, overflow: "hidden" }}
            >
              <Pressable
                onPress={() => setOpenDay(isOpen ? null : i)}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                aria-expanded={isOpen}
                accessibilityLabel={`Day ${day.day}. ${day.title}. ${isOpen ? "Open, tap to close" : "Closed, tap to open"}`}
                style={{ minHeight: 64, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 }}
              >
                <View style={{ flex: 1 }}>
                  <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 12, lineHeight: 17, letterSpacing: 0.4, color: c.primary }}>
                    READY-MADE · DAY {day.day}
                  </Text>
                  <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, lineHeight: 21, color: c.textPrimary }}>{day.title}</Text>
                </View>
                {isOpen ? <ChevronUp color={c.primary} size={22} /> : <ChevronDown color={c.textSecondary} size={22} />}
              </Pressable>

              {isOpen && (
                <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: c.borderSoft, paddingTop: 4 }}>
                  <DayPart Icon={Sunrise} label="Morning" text={day.morning} />
                  <DayPart Icon={Sun} label="Afternoon" text={day.afternoon} />
                  <DayPart Icon={Moon} label="Evening" text={day.evening} />
                  <Fact label="Stay" text={day.stay} />
                  <Fact label="Meals" text={day.meals} />
                  <Fact label="Tip" text={day.tips} />
                  <Pressable
                    onPress={onPlanTrip}
                    accessibilityRole="button"
                    accessibilityLabel={`Plan my own trip to ${placeName} with AI`}
                    android_ripple={{ color: withOpacity(c.onPrimary, 0.2) }}
                    style={{
                      marginTop: 16, minHeight: 48, borderRadius: 12, backgroundColor: c.primary, flexDirection: "row",
                      alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    <Sparkles color={c.onPrimary} size={18} />
                    <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.onPrimary }}>Plan my own with AI</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}

        {days.length > 1 && (
          <Pressable
            onPress={() => { setShowAll((s) => !s); if (showAll) setOpenDay((o) => (o != null && o > 0 ? null : o)); }}
            accessibilityRole="button"
            accessibilityLabel={showAll ? "Show Day 1 only" : `Show all ${days.length} days`}
            android_ripple={{ color: withOpacity(c.primary, 0.12) }}
            style={{
              minHeight: 48, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, alignItems: "center", justifyContent: "center",
            }}
          >
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary }}>
              {showAll ? "Show Day 1 only" : `Show all ${days.length} days`}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function DayPart({ Icon, label, text }: { Icon: LucideIcon; label: string; text: string }) {
  const c = useThemeColors();
  return (
    <View style={{ marginTop: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
        <Icon color={c.teal} size={15} />
        <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 13, lineHeight: 19, color: c.teal }}>{label}</Text>
      </View>
      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 22, color: c.textSecondary }}>{text}</Text>
    </View>
  );
}

function Fact({ label, text }: { label: string; text: string }) {
  const c = useThemeColors();
  if (!text) return null;
  return (
    <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 21, color: c.textSecondary, marginTop: 10 }}>
      <Text style={{ fontFamily: "Poppins_700Bold", color: c.textPrimary }}>{label}</Text> · {text}
    </Text>
  );
}
