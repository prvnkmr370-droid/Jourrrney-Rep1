/** Make-only reference (no Figma frame). */
import { View, Text } from "react-native";
import { Bus } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";

export default function LocalTravelTab({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textSecondary, marginBottom: 16 }}>
        How to get around once you're in {d.name}.
      </Text>

      <View style={{ gap: 12 }}>
        {d.localTransport.map((t) => (
          <View
            key={t.mode}
            style={{
              flexDirection: "row", alignItems: "center", gap: 14,
              backgroundColor: c.surface, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 14,
              opacity: t.available ? 1 : 0.5,
            }}
          >
            <View
              style={{
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: withOpacity(c.teal, 0.12), alignItems: "center", justifyContent: "center",
              }}
            >
              <Bus color={c.teal} size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>{t.mode}</Text>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.primary }}>{t.cost}</Text>
              </View>
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>
                {t.notes}{!t.available ? " — not available here" : ""}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
