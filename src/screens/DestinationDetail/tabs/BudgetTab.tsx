/** Make-only reference (no Figma frame). */
import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { BudgetTier, Destination } from "@/data/destinations";
import { useThemeColors } from "@/theme/useThemeColors";

const SPEND_ROWS = [
  { key: "accommodation" as const, label: "Accommodation", icon: "🏨" },
  { key: "food" as const, label: "Food & Drinks", icon: "🍛" },
  { key: "transport" as const, label: "Local Transport", icon: "🛺" },
  { key: "activities" as const, label: "Activities & Entry", icon: "🎟️" },
];

export default function BudgetTab({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  const [tier, setTier] = useState<BudgetTier>("mid");
  const selected = d.budgetBreakdown.find((b) => b.tier === tier) ?? d.budgetBreakdown[0];

  return (
    <View style={{ padding: 20 }}>
      {/* Tier selector */}
      <View style={{ flexDirection: "row", gap: 6, backgroundColor: c.surfaceAlt, borderRadius: 16, padding: 4, marginBottom: 20 }}>
        {d.budgetBreakdown.map((b) => {
          const active = tier === b.tier;
          return (
            <Pressable
              key={b.tier}
              onPress={() => setTier(b.tier)}
              style={{
                flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12,
                backgroundColor: active ? "#333C81" : "transparent",
              }}
            >
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: active ? "#FFFFFF" : c.textSecondary }}>
                {b.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Total per day */}
      <LinearGradient
        colors={["#333C81", "#C44A0A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, padding: 20, alignItems: "center", marginBottom: 20 }}
      >
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>
          Estimated per person / day
        </Text>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 34, color: "#FFFFFF" }}>
          ₹{selected.perDayPerPerson.toLocaleString("en-IN")}
        </Text>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
          For {d.duration}
        </Text>
      </LinearGradient>

      {/* marginBottom: 12 matches the heading-to-content gap used elsewhere
          on Destination Detail (e.g. Nearby tab's section headings). */}
      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary, marginBottom: 12 }}>
        Daily Spend Breakdown
      </Text>
      <View>
        {SPEND_ROWS.map(({ key, label, icon }, i) => (
          <View
            key={key}
            style={{
              flexDirection: "row", alignItems: "center", justifyContent: "space-between",
              paddingVertical: 12, borderBottomWidth: i < SPEND_ROWS.length - 1 ? 1 : 0, borderBottomColor: c.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={{ fontSize: 18 }}>{icon}</Text>
              <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 13, color: c.textPrimary }}>{label}</Text>
            </View>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.teal }}>
              ₹{selected[key].toLocaleString("en-IN")}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
