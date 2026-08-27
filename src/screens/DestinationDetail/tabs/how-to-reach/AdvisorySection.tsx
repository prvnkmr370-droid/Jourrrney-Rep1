import { View, Text } from "react-native";
import type { TravelAdvisory } from "@/data/journeyGuides";
import { useResolvedScheme, useThemeColors } from "@/theme/useThemeColors";
import { Card, SectionLabel, Bullet, rgba } from "./shared";

// "Caution" uses a yellow not in the shared palette (danger/warning/success
// already cover red/amber/teal elsewhere), so it gets its own light/dark
// text variant here, same pattern as EssentialsSection's rainbow colors.
const CAUTION_TEXT = { light: "#A16207", dark: "#FCD34D" } as const;

function alertStyles(c: ReturnType<typeof useThemeColors>, cautionText: string) {
  return {
    warning: { bg: rgba(c.danger, 0.08), border: rgba(c.danger, 0.3), label: "Warning", labelBg: rgba(c.danger, 0.15), text: c.danger },
    caution: { bg: rgba("#EAB308", 0.08), border: "rgba(234,179,8,0.35)", label: "Caution", labelBg: rgba("#EAB308", 0.18), text: cautionText },
    info: { bg: rgba(c.teal, 0.08), border: rgba(c.teal, 0.25), label: "Info", labelBg: rgba(c.teal, 0.12), text: c.teal },
  } as const;
}

export default function AdvisorySection({ advisory, destName }: { advisory: TravelAdvisory; destName: string }) {
  const c = useThemeColors();
  const scheme = useResolvedScheme();
  const ALERT_STYLE = alertStyles(c, CAUTION_TEXT[scheme]);

  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#333C81" }} />
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>
          Source: <Text style={{ fontFamily: "Poppins_700Bold" }}>{advisory.updatedFrom}</Text>
        </Text>
      </View>

      <Card>
        <View style={{ padding: 16 }}>
          <SectionLabel color={c.primary}>Best Time to Visit</SectionLabel>
          <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary, marginBottom: 12 }}>
            {advisory.bestTimeToVisit}
          </Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Text style={{ fontSize: 12 }}>🌟</Text>
              <View>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.textPrimary }}>Peak Season</Text>
                <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{advisory.peakSeason}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Text style={{ fontSize: 12 }}>💸</Text>
              <View>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.textPrimary }}>Off Season</Text>
                <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{advisory.offSeason}</Text>
              </View>
            </View>
          </View>
        </View>
      </Card>

      <View>
        <SectionLabel>Active Alerts</SectionLabel>
        <View style={{ gap: 10 }}>
          {advisory.alerts.map((alert) => {
            const s = ALERT_STYLE[alert.level];
            return (
              <View key={alert.title} style={{ backgroundColor: s.bg, borderWidth: 1.5, borderColor: s.border, borderRadius: 16, padding: 14 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <Text style={{ fontSize: 15 }}>{alert.icon}</Text>
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: s.text, flex: 1 }}>{alert.title}</Text>
                  <View style={{ backgroundColor: s.labelBg, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 10, color: s.text }}>{s.label}</Text>
                  </View>
                </View>
                <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: c.textPrimary }}>{alert.detail}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ backgroundColor: rgba(c.success, 0.08), borderWidth: 1.5, borderColor: rgba(c.success, 0.25), borderRadius: 16, padding: 14 }}>
        <SectionLabel color={c.success}>✅ Dos in {destName}</SectionLabel>
        <View style={{ gap: 6 }}>
          {advisory.dos.map((tip) => (
            <Bullet key={tip} text={tip} dotColor={c.success} />
          ))}
        </View>
      </View>

      <View style={{ backgroundColor: rgba(c.danger, 0.06), borderWidth: 1.5, borderColor: rgba(c.danger, 0.22), borderRadius: 16, padding: 14 }}>
        <SectionLabel color={c.danger}>❌ Don'ts in {destName}</SectionLabel>
        <View style={{ gap: 6 }}>
          {advisory.donts.map((tip) => (
            <Bullet key={tip} text={tip} dotColor={c.danger} />
          ))}
        </View>
      </View>

      <View>
        <SectionLabel>Emergency Contacts</SectionLabel>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {advisory.emergencyContacts.map((contact) => (
            <View
              key={contact.label}
              style={{
                flexDirection: "row", alignItems: "center", gap: 8, width: "48%",
                backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 10,
              }}
            >
              <Text style={{ fontSize: 15 }}>{contact.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 10, color: c.textPrimary }} numberOfLines={1}>{contact.label}</Text>
                <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: c.primary }}>{contact.number}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ backgroundColor: rgba(c.teal, 0.08), borderWidth: 1, borderColor: rgba(c.teal, 0.25), borderRadius: 16, padding: 14 }}>
        <SectionLabel color={c.teal}>💊 Health Tips</SectionLabel>
        <View style={{ gap: 6 }}>
          {advisory.healthTips.map((tip) => (
            <Bullet key={tip} text={tip} dotColor={c.teal} />
          ))}
        </View>
      </View>

      <View style={{ backgroundColor: rgba(c.gold, 0.08), borderWidth: 1, borderColor: rgba(c.gold, 0.25), borderRadius: 16, padding: 14 }}>
        <SectionLabel color={c.gold}>🎭 Culture & Customs</SectionLabel>
        <View style={{ gap: 6 }}>
          {advisory.culturalNotes.map((tip) => (
            <Bullet key={tip} text={tip} dotColor={c.gold} />
          ))}
        </View>
      </View>

      <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 14 }}>
        <SectionLabel>💰 Money & Banking</SectionLabel>
        <View style={{ gap: 6 }}>
          {advisory.moneyTips.map((tip) => (
            <Bullet key={tip} text={tip} />
          ))}
        </View>
      </View>
    </View>
  );
}
