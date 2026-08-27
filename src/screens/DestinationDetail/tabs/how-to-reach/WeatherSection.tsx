import { View, Text } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import type { JourneyGuide } from "@/data/journeyGuides";
import { useThemeColors } from "@/theme/useThemeColors";
import { Card, CheckItem, rgba } from "./shared";

export default function WeatherSection({ destination: d, guide }: { destination: Destination; guide?: JourneyGuide }) {
  const c = useThemeColors();
  return (
    <View style={{ gap: 16 }}>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary }}>
        Pack smart for {d.name} — what you carry depends entirely on{" "}
        <Text style={{ fontFamily: "Poppins_700Bold", color: c.textPrimary }}>when you travel</Text>.
      </Text>

      {guide ? (
        <View style={{ gap: 14 }}>
          {guide.weatherSeasons.map((season) => (
            <Card key={season.season}>
              <View style={{ padding: 14, backgroundColor: rgba(c.primary, 0.06), borderBottomWidth: 1, borderBottomColor: c.border }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ fontSize: 24 }}>{season.icon}</Text>
                    <View>
                      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>{season.season}</Text>
                      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{season.months}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.teal }}>{season.tempRange}</Text>
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{season.feels}</Text>
                  </View>
                </View>
              </View>

              <View style={{ padding: 14, gap: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: rgba(c.warning, 0.12), borderWidth: 1, borderColor: rgba(c.warning, 0.25), borderRadius: 12, padding: 12 }}>
                  <AlertTriangle color={c.warning} size={14} />
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, lineHeight: 16, color: c.textPrimary, flex: 1 }}>{season.warning}</Text>
                </View>

                <View>
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.textPrimary, marginBottom: 6 }}>📦 What to Carry</Text>
                  <View style={{ gap: 6 }}>
                    {season.carry.map((item) => (
                      <CheckItem key={item} text={item} />
                    ))}
                  </View>
                </View>

                <View style={{ backgroundColor: c.surfaceAlt, borderRadius: 12, padding: 12 }}>
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.teal, marginBottom: 3 }}>Clothing advice</Text>
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textPrimary }}>{season.clothingAdvice}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <Card>
          <View style={{ padding: 16 }}>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary, marginBottom: 10 }}>What to Pack</Text>
            <View style={{ gap: 8 }}>
              {d.packingTips.map((tip) => (
                <CheckItem key={tip} text={tip} />
              ))}
            </View>
          </View>
        </Card>
      )}
    </View>
  );
}
