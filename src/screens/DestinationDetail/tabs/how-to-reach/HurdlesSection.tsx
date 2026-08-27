import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { CheckCircle, ChevronDown, ChevronUp } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import type { CityHurdle, JourneyGuide } from "@/data/journeyGuides";
import { useThemeColors } from "@/theme/useThemeColors";
import { Card, rgba } from "./shared";

// Severity styling depends on the theme's danger/warning tokens and
// surfaceAlt/border, so it's built per-render rather than as a module
// constant (which would freeze it to whichever theme first evaluated it).
function severityStyles(c: ReturnType<typeof useThemeColors>) {
  return {
    high: { border: rgba(c.danger, 0.25), bg: rgba(c.danger, 0.1), text: c.danger, label: "⚠️ High risk" },
    medium: { border: rgba(c.warning, 0.25), bg: rgba(c.warning, 0.1), text: c.warning, label: "⚡ Watch out" },
    low: { border: c.border, bg: c.surfaceAlt, text: c.textSecondary, label: "ℹ️ Good to know" },
  } as const;
}

export default function HurdlesSection({ destination: d, guide }: { destination: Destination; guide?: JourneyGuide }) {
  const c = useThemeColors();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    // gap: 16 matches ArriveSection/WeatherSection/AdvisorySection so the
    // block rhythm doesn't shift when switching between How to Reach's
    // sub-tabs (they all render inside the same HowToReachTab shell).
    <View style={{ gap: 16 }}>
      <View style={{ backgroundColor: rgba(c.danger, 0.08), borderWidth: 1, borderColor: rgba(c.danger, 0.2), borderRadius: 16, padding: 14 }}>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: c.textPrimary }}>
          Real hurdles that travelers commonly face in{" "}
          <Text style={{ fontFamily: "Poppins_700Bold" }}>{d.name}</Text> — and exactly how to deal with them. Know before you go.
        </Text>
      </View>

      {guide
        ? guide.cityHurdles.map((h, i) => <HurdleCard key={h.issue} hurdle={h} expanded={expanded === i} onToggle={() => setExpanded(expanded === i ? null : i)} />)
        : d.transport.map((t) => (
            <Card key={t.mode}>
              <View style={{ padding: 14 }}>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.textPrimary, marginBottom: 4 }}>{t.mode}</Text>
                <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary }}>{t.tips}</Text>
              </View>
            </Card>
          ))}
    </View>
  );
}

function HurdleCard({ hurdle: h, expanded, onToggle }: { hurdle: CityHurdle; expanded: boolean; onToggle: () => void }) {
  const c = useThemeColors();
  const s = severityStyles(c)[h.severity];
  return (
    <Card borderColor={s.border}>
      <Pressable onPress={onToggle} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14 }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: s.bg, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 18 }}>{h.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary, marginBottom: 4 }}>{h.issue}</Text>
          <View style={{ alignSelf: "flex-start", backgroundColor: s.bg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 10, color: s.text }}>{s.label}</Text>
          </View>
        </View>
        {expanded ? <ChevronUp color={c.textMuted} size={16} /> : <ChevronDown color={c.textMuted} size={16} />}
      </Pressable>

      {expanded && (
        <View style={{ paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: c.border, paddingTop: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: rgba(c.success, 0.1), borderWidth: 1, borderColor: rgba(c.success, 0.2), borderRadius: 12, padding: 12 }}>
            <CheckCircle color={c.success} size={16} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.success, marginBottom: 3 }}>What to do</Text>
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: c.textPrimary }}>{h.solution}</Text>
            </View>
          </View>
        </View>
      )}
    </Card>
  );
}
