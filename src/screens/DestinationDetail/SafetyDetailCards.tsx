/**
 * The 6 "prime" safety cards (always visible) plus a "More safety
 * details" expander revealing the remaining 12 — per the user's request
 * to surface the 5-6 most important safety details up front on a
 * destination's page, with the rest one tap away. Tapping any card (prime
 * or "more") opens a detail sheet with its full guidance and a
 * sourceNote clarifying whether it's real per-destination data or
 * general guidance for that type of destination — see safetyDetails.ts.
 */
import { useState } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { X, ChevronDown, ChevronUp } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { getSafetyDetails, PRIME_SAFETY_KEYS, MORE_SAFETY_KEYS, type SafetyCategoryKey, type SafetyCategoryContent } from "@/data/safetyDetails";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";

export default function SafetyDetailCards({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  const [showMore, setShowMore] = useState(false);
  const [activeKey, setActiveKey] = useState<SafetyCategoryKey | null>(null);

  const all = getSafetyDetails(d);
  const active = activeKey ? all[activeKey] : null;

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary, marginBottom: 10 }}>
        Safety at a Glance
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {PRIME_SAFETY_KEYS.map((key) => (
          <Card key={key} content={all[key]} c={c} onPress={() => setActiveKey(key)} />
        ))}
      </View>

      <Pressable
        onPress={() => setShowMore((v) => !v)}
        style={{
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
          marginTop: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: c.surfaceAlt,
        }}
      >
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, color: c.textSecondary }}>
          {showMore ? "Show less" : "More safety details"}
        </Text>
        {showMore ? <ChevronUp color={c.textSecondary} size={14} /> : <ChevronDown color={c.textSecondary} size={14} />}
      </Pressable>

      {showMore && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
          {MORE_SAFETY_KEYS.map((key) => (
            <Card key={key} content={all[key]} c={c} onPress={() => setActiveKey(key)} />
          ))}
        </View>
      )}

      <Modal visible={!!active} animationType="slide" transparent onRequestClose={() => setActiveKey(null)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: c.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "75%" }}>
            {active && (
              <>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, paddingBottom: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                    <Text style={{ fontSize: 22 }}>{active.emoji}</Text>
                    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 16, color: c.textPrimary, flex: 1 }}>{active.label}</Text>
                  </View>
                  <Pressable onPress={() => setActiveKey(null)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center" }}>
                    <X color={c.textSecondary} size={16} />
                  </Pressable>
                </View>
                <ScrollView style={{ paddingHorizontal: 20 }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                  <View style={{ gap: 10, marginBottom: 16 }}>
                    {active.details.map((line, i) => (
                      <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: c.surfaceAlt, borderRadius: 12, padding: 12 }}>
                        <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: c.primary, marginTop: 7 }} />
                        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textPrimary, flex: 1 }}>{line}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, lineHeight: 16, color: c.textMuted, fontStyle: "italic" }}>
                    {active.sourceNote}
                  </Text>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Card({ content, c, onPress }: { content: SafetyCategoryContent; c: ReturnType<typeof useThemeColors>; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: "47%", backgroundColor: c.surface, borderWidth: 1, borderColor: c.border,
        borderRadius: 16, padding: 12, gap: 6,
      }}
    >
      <Text style={{ fontSize: 20 }}>{content.emoji}</Text>
      <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, color: c.textPrimary }}>{content.label}</Text>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10.5, lineHeight: 14, color: c.textSecondary }} numberOfLines={2}>
        {content.summary}
      </Text>
    </Pressable>
  );
}
