/** Make-only reference (no Figma frame). */
import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Sparkles, ChevronDown, ChevronUp, Sunrise, Sun, Moon, Utensils, Lightbulb, type LucideIcon } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";

interface Props {
  destination: Destination;
  onPlanTrip: (destId: string) => void;
}

export default function ItineraryTab({ destination: d, onPlanTrip }: Props) {
  const c = useThemeColors();
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  return (
    <View style={{ padding: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary }}>
          Suggested {d.defaultItinerary.length}-Day Plan
        </Text>
        <Pressable
          onPress={() => onPlanTrip(d.id)}
          style={{
            flexDirection: "row", alignItems: "center", gap: 6,
            backgroundColor: withOpacity(c.primary, 0.12), borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
          }}
        >
          <Sparkles color={c.primary} size={14} />
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.primary }}>Customise with AI</Text>
        </Pressable>
      </View>

      <View style={{ gap: 12 }}>
        {d.defaultItinerary.map((day, i) => {
          const expanded = expandedDay === i;
          return (
            <View
              key={day.day}
              style={{ backgroundColor: c.surface, borderRadius: 16, borderWidth: 1, borderColor: c.border, overflow: "hidden" }}
            >
              <Pressable
                onPress={() => setExpandedDay(expanded ? null : i)}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }}
              >
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#333C81", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: "#FFFFFF" }}>{day.day}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>{day.title}</Text>
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>Stay: {day.stay}</Text>
                </View>
                {expanded ? <ChevronUp color={c.textSecondary} size={16} /> : <ChevronDown color={c.textSecondary} size={16} />}
              </Pressable>

              {expanded && (
                <View style={{ paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: c.border, paddingTop: 12, gap: 10 }}>
                  <DayPart Icon={Sunrise} time="Morning" text={day.morning} c={c} />
                  <DayPart Icon={Sun} time="Afternoon" text={day.afternoon} c={c} />
                  <DayPart Icon={Moon} time="Evening" text={day.evening} c={c} />
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <View style={{ flex: 1, backgroundColor: c.surfaceAlt, borderRadius: 10, padding: 10 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 }}>
                        <Utensils color={c.textPrimary} size={11} />
                        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.textPrimary }}>Meals</Text>
                      </View>
                      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{day.meals}</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: withOpacity(c.gold, 0.12), borderRadius: 10, padding: 10 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 }}>
                        <Lightbulb color={c.textPrimary} size={11} />
                        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.textPrimary }}>Pro Tip</Text>
                      </View>
                      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{day.tips}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function DayPart({ Icon, time, text, c }: { Icon: LucideIcon; time: string; text: string; c: ReturnType<typeof useThemeColors> }) {
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 2 }}>
        <Icon color={c.teal} size={13} />
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.teal }}>{time}</Text>
      </View>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textSecondary }}>{text}</Text>
    </View>
  );
}
