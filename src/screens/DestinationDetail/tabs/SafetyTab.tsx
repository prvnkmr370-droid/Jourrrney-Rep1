/**
 * The "Is it safe?" page, in a friendly voice (see utils/safetyTone.ts). No score
 * first: one calm sentence for women, what helps here, a few things worth knowing
 * before you go (each with an easy fix), comfortable places, areas that are nicer
 * in daylight or with company (always with somewhere to go instead), easy habits,
 * the usual safety cards, and numbers to call if you ever need a hand.
 *
 * Everything comes from the place's own guide (womenSafety, journeyGuides): this is
 * the guide's view, not live crime data, and the page says so. A real hazard is still
 * listed plainly, just worded kindly. Calm colours (teal, gold) always come with a word
 * and an icon, never colour alone; there is no red and no warning triangle for tips.
 */
import { View, Text, Pressable, Linking, Alert } from "react-native";
import { CircleCheck, HeartHandshake, Info, Lightbulb, Moon, Phone, Sparkles, Check, CloudSun } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { getJourneyGuide, type CityHurdle } from "@/data/journeyGuides";
import { cleanAreas, safetyVerdict, softened } from "@/utils/safetyTone";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";
import { useDestinationWeather } from "@/hooks/useDestinationWeather";
import SafetyDetailCards from "../SafetyDetailCards";

const MAX_FONT = 1.3;
const SEVERITY_ORDER: Record<CityHurdle["severity"], number> = { high: 3, medium: 2, low: 1 };

async function call(number: string) {
  try {
    await Linking.openURL(`tel:${number.replace(/[^\d+]/g, "")}`);
  } catch {
    Alert.alert("Couldn't start the call", `You can dial ${number} yourself.`);
  }
}

export default function SafetyTab({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  const { womenSafety: ws } = d;
  const guide = getJourneyGuide(d.id);
  const placeName = d.name.replace(/\s*\([^)]*\)/g, "").trim();
  const comfortable = cleanAreas(ws.safeZones);
  const quieter = cleanAreas(ws.avoidAreas);
  // Solo-travel tips first, then the precautions, said as gentle habits and without repeats.
  const habits = [...new Set([...ws.soloTips, ...ws.precautions].map(softened))];
  const hurdles = [...(guide?.cityHurdles ?? [])].sort((a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity]).slice(0, 3);
  const severity: Record<CityHurdle["severity"], { word: string; Icon: typeof Lightbulb; color: string }> = {
    high: { word: "Plan ahead", Icon: Lightbulb, color: c.gold },
    medium: { word: "Keep in mind", Icon: Info, color: c.teal },
    low: { word: "Good to know", Icon: Info, color: c.textSecondary },
  };
  const { weather } = useDestinationWeather(d.id);

  const Heading = ({ title, sub }: { title: string; sub?: string }) => (
    <View style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 8 }}>
      <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 18, lineHeight: 25, color: c.textPrimary }}>{title}</Text>
      {sub ? <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary, marginTop: 2 }}>{sub}</Text> : null}
    </View>
  );
  const Chips = ({ items, color, Icon }: { items: string[]; color: string; Icon: typeof Check }) => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16 }}>
      {items.map((x) => (
        <View key={x} style={{ flexDirection: "row", alignItems: "flex-start", gap: 6, borderWidth: 1.5, borderColor: withOpacity(color, 0.6), borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, maxWidth: "100%" }}>
          <Icon color={color} size={14} style={{ marginTop: 3 }} />
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ flexShrink: 1, fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textPrimary }}>{x}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ paddingBottom: 8 }}>
      {/* Our view: one calm sentence, with an honest note about where it comes from. */}
      <View style={{ marginHorizontal: 16, marginTop: 14, padding: 16, borderRadius: 16, borderWidth: 1.5, borderColor: withOpacity(c.teal, 0.45), backgroundColor: withOpacity(c.teal, 0.07) }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Sparkles color={c.teal} size={15} />
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 12.5, lineHeight: 18, color: c.teal }}>OUR VIEW FOR WOMEN</Text>
        </View>
        <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 17, lineHeight: 25, color: c.textPrimary, marginTop: 6 }}>{safetyVerdict(d)}</Text>
        <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
          <Info color={c.textSecondary} size={13} style={{ marginTop: 3 }} />
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textSecondary }}>
            From our travel guide for {placeName}, not live crime data. Every trip is different.
          </Text>
        </View>
      </View>

      {weather ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginTop: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: c.borderSoft, backgroundColor: c.surfaceAlt }}>
          <CloudSun color={weather.severity === "clear" ? c.teal : c.gold} size={24} />
          <View style={{ flex: 1 }}>
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, lineHeight: 20, color: c.textPrimary }}>Weather today</Text>
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary }}>
              {weather.condition} · {Math.round(weather.tempC)}°C · {weather.verdict}
            </Text>
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textMuted }}>Live from Open-Meteo. A simple guide, not an official forecast.</Text>
          </View>
        </View>
      ) : null}

      {ws.highlights.length > 0 ? (
        <>
          <Heading title="What helps here" />
          <View style={{ gap: 8, paddingHorizontal: 16 }}>
            {ws.highlights.slice(0, 3).map((h) => (
              <View key={h} style={{ flexDirection: "row", gap: 8, padding: 12, borderRadius: 12, backgroundColor: withOpacity(c.teal, 0.1) }}>
                <CircleCheck color={c.teal} size={16} style={{ marginTop: 2 }} />
                <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 20, color: c.textPrimary }}>{h}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {hurdles.length > 0 ? (
        <>
          <Heading title="Good to know before you go" sub="A few things travellers run into here, and an easy way round each." />
          <View style={{ gap: 10, paddingHorizontal: 16 }}>
            {hurdles.map((h) => {
              const sev = severity[h.severity];
              return (
                <View key={h.issue} style={{ padding: 12, borderRadius: 14, borderWidth: 1, borderColor: c.borderSoft, backgroundColor: c.surfaceAlt }}>
                  <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderColor: withOpacity(sev.color, 0.6), borderRadius: 999, paddingHorizontal: 10, paddingVertical: 1 }}>
                    <sev.Icon color={sev.color} size={12} />
                    <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 12, lineHeight: 17, color: sev.color }}>{sev.word}</Text>
                  </View>
                  <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, lineHeight: 20, color: c.textPrimary, marginTop: 6 }}>{h.issue}</Text>
                  <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20, color: c.textSecondary, marginTop: 3 }}>
                    <Text style={{ fontFamily: "Poppins_700Bold", color: c.textPrimary }}>Easy fix: </Text>
                    {h.solution}
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      ) : null}

      {comfortable.length > 0 ? (
        <>
          <Heading title="Comfortable places to spend time" />
          <Chips items={comfortable} color={c.teal} Icon={Check} />
        </>
      ) : null}

      {quieter.length > 0 ? (
        <>
          <Heading title="Nicer in daylight or with company" sub="These areas are quieter once it gets dark." />
          <Chips items={quieter} color={c.textSecondary} Icon={Moon} />
          {comfortable.length > 0 ? (
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20, color: c.textSecondary, paddingHorizontal: 20, paddingTop: 8 }}>
              <Text style={{ fontFamily: "Poppins_700Bold", color: c.textPrimary }}>Try instead: </Text>
              {comfortable.slice(0, 2).join(", ")}
            </Text>
          ) : null}
        </>
      ) : null}

      {habits.length > 0 ? (
        <>
          <Heading title="Easy habits for solo travel" />
          <View style={{ marginHorizontal: 16, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: c.borderSoft, backgroundColor: c.surfaceAlt }}>
            {habits.map((t, i) => (
              <View key={t} style={{ flexDirection: "row", gap: 10, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: c.borderSoft }}>
                <Lightbulb color={c.gold} size={16} style={{ marginTop: 3 }} />
                <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 20, color: c.textPrimary }}>{t}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
        <SafetyDetailCards destination={d} />
      </View>

      <Heading title="If you ever need a hand" />
      <View style={{ marginHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: c.borderSoft, backgroundColor: c.surfaceAlt, overflow: "hidden" }}>
        {ws.emergencyContacts.map((contact, i) => (
          <View key={contact.label} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderTopColor: c.borderSoft }}>
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_600SemiBold", fontSize: 14, lineHeight: 20, color: c.textPrimary }}>{contact.label}</Text>
            <Pressable
              onPress={() => call(contact.number)}
              accessibilityRole="button"
              accessibilityLabel={`Call ${contact.label}, ${contact.number}`}
              android_ripple={{ color: withOpacity(c.teal, 0.15) }}
              style={{ minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1.5, borderColor: withOpacity(c.teal, 0.7), flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Phone color={c.teal} size={16} />
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, lineHeight: 20, color: c.teal }}>{contact.number}</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 20, marginTop: 18 }}>
        <HeartHandshake color={c.gold} size={16} style={{ marginTop: 2 }} />
        <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 20, color: c.textSecondary }}>
          This is our travel guide's own view, written from local tourism guidance, not live crime data. Every trip is different, so go at your own pace and trust your instincts.
        </Text>
      </View>
    </View>
  );
}
