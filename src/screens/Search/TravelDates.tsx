/** Source of truth: Figma "1.3.3 Travel Dates — Optional". */
import { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/theme/useThemeColors";

interface Props {
  onSkip: () => void;
  onContinue: (isoDate: string | null) => void;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function TravelDates({ onSkip, onContinue }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const [selected, setSelected] = useState<number | null>(null);

  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthLabel = `${MONTH_NAMES[month]} ${year}`;

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const handleContinue = () => {
    if (selected) {
      const iso = new Date(year, month, selected).toISOString().split("T")[0];
      onContinue(iso);
    } else {
      onContinue(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingHorizontal: 20, paddingTop: insets.top + 40, paddingBottom: Math.max(insets.bottom, 24) }}>
      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 22, color: c.textPrimary, marginBottom: 8 }}>When are you going?</Text>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary, marginBottom: 24 }}>
        Optional — skip if you're still exploring dates.
      </Text>

      <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 20, padding: 16, marginBottom: 24 }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary, marginBottom: 12 }}>{monthLabel}</Text>

        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          {WEEKDAY_LABELS.map((d, i) => (
            <Text key={`${d}-${i}`} style={{ flex: 1, textAlign: "center", fontFamily: "Poppins_600SemiBold", fontSize: 10, color: c.textMuted }}>
              {d}
            </Text>
          ))}
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {cells.map((day, i) => {
            const isSelected = day === selected;
            const isToday = day === today.getDate();
            return (
              <Pressable
                key={i}
                disabled={day == null}
                onPress={() => day && setSelected(day)}
                style={{
                  width: "14.28%", aspectRatio: 1, alignItems: "center", justifyContent: "center",
                }}
              >
                {day != null && (
                  <View
                    style={{
                      width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center",
                      backgroundColor: isSelected ? "#333C81" : "transparent",
                      borderWidth: !isSelected && isToday ? 1 : 0, borderColor: "#333C81",
                    }}
                  >
                    <Text style={{ fontFamily: isSelected ? "Poppins_700Bold" : "Poppins_400Regular", fontSize: 13, color: isSelected ? "#FFFFFF" : c.textPrimary }}>
                      {day}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable onPress={onSkip} style={{ flex: 1, backgroundColor: c.surfaceAlt, borderRadius: 16, paddingVertical: 15, alignItems: "center" }}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textSecondary }}>Skip for now</Text>
        </Pressable>
        <Pressable onPress={handleContinue} style={{ flex: 1, backgroundColor: "#333C81", borderRadius: 16, paddingVertical: 15, alignItems: "center" }}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: "#FFFFFF" }}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}
