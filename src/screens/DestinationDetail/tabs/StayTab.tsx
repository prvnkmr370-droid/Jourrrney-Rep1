/** Make-only reference (no Figma frame). */
import { View, Text } from "react-native";
import { Home } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { useThemeColors } from "@/theme/useThemeColors";

export default function StayTab({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textSecondary, marginBottom: 20 }}>
        Accommodation options across all budgets in {d.name}.
      </Text>

      <View style={{ gap: 16 }}>
        {d.accommodation.map((acc) => (
          <View
            key={acc.type}
            style={{ backgroundColor: c.surface, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 16 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Home color={c.teal} size={16} />
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary }}>{acc.type}</Text>
              </View>
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.primary }}>{acc.priceRange}</Text>
            </View>
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: c.textSecondary, marginBottom: 12 }}>
              {acc.description}
            </Text>
            <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: c.textPrimary, marginBottom: 6 }}>
              Recommended:
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {acc.examples.map((ex) => (
                <View key={ex} style={{ backgroundColor: c.surfaceAlt, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textPrimary }}>{ex}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
