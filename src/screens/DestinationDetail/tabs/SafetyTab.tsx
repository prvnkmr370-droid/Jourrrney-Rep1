/** Make-only reference (no Figma frame). */
import { View, Text, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle, AlertTriangle, Phone, CloudAlert } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";
import { useDestinationWeather, type WeatherSeverity } from "@/hooks/useDestinationWeather";
import SafetyDetailCards from "../SafetyDetailCards";

export default function SafetyTab({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  const { womenSafety: ws } = d;

  return (
    <View style={{ padding: 20 }}>
      {/* Score card */}
      <LinearGradient
        colors={["#0D5C63", "#1A8A94"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, padding: 20, marginBottom: 20 }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <View>
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
              Women Safety Score
            </Text>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 38, color: "#FFFFFF" }}>
              {ws.score}
              <Text style={{ fontSize: 20, color: "rgba(255,255,255,0.6)" }}>/10</Text>
            </Text>
            <View style={{ alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 }}>
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: "#FFFFFF" }}>{ws.level}</Text>
            </View>
          </View>
          <Text style={{ fontSize: 44, opacity: 0.3 }}>🛡️</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 3 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View
              key={i}
              style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i < ws.score ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)" }}
            />
          ))}
        </View>
      </LinearGradient>

      <WeatherAlertCard destinationId={d.id} c={c} />

      <SafetyDetailCards destination={d} />

      <SafetySection title="✅ Safety Highlights" c={c}>
        {ws.highlights.map((h) => (
          <IconRow key={h} icon={<CheckCircle color={c.success} size={16} />} text={h} bg={withOpacity(c.success, 0.1)} c={c} />
        ))}
      </SafetySection>

      <SafetySection title="👩 Solo Women Travel Tips" c={c}>
        {ws.soloTips.map((tip) => (
          <IconRow key={tip} icon={<Text style={{ fontSize: 15 }}>💡</Text>} text={tip} bg={c.surfaceAlt} c={c} />
        ))}
      </SafetySection>

      <SafetySection title="⚠️ Precautions" c={c}>
        {ws.precautions.map((p) => (
          <IconRow key={p} icon={<AlertTriangle color={c.warning} size={16} />} text={p} bg={withOpacity(c.warning, 0.1)} c={c} />
        ))}
      </SafetySection>

      <SafetySection title="📞 Emergency Contacts" last c={c}>
        {ws.emergencyContacts.map((contact) => (
          <View
            key={contact.label}
            style={{
              flexDirection: "row", alignItems: "center", justifyContent: "space-between",
              backgroundColor: withOpacity(c.danger, 0.08), borderWidth: 1, borderColor: withOpacity(c.danger, 0.2),
              borderRadius: 12, padding: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Phone color={c.danger} size={16} />
              <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 13, color: c.textPrimary }}>{contact.label}</Text>
            </View>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.danger }}>{contact.number}</Text>
          </View>
        ))}
      </SafetySection>

      <Tags title="✅ Safe Zones" color={c.success} items={ws.safeZones} />
      <Tags title="⛔ Avoid After Dark" color={c.danger} items={ws.avoidAreas} />
    </View>
  );
}

const SEVERITY_COLOR: Record<WeatherSeverity, keyof ReturnType<typeof useThemeColors>> = {
  clear: "success",
  caution: "warning",
  severe: "danger",
};

/**
 * Real live weather via Open-Meteo (see useDestinationWeather.ts) — not
 * fabricated. The "safe to travel" verdict underneath it is this app's
 * own heuristic (heavy rain/storms/high wind/extreme heat or cold), not
 * an official advisory — labelled as such so it doesn't read as more
 * authoritative than it is.
 */
function WeatherAlertCard({ destinationId, c }: { destinationId: string; c: ReturnType<typeof useThemeColors> }) {
  const { loading, error, weather } = useDestinationWeather(destinationId);

  if (loading) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surfaceAlt, borderRadius: 16, padding: 16, marginBottom: 20 }}>
        <ActivityIndicator color={c.textSecondary} size="small" />
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary }}>Checking current weather…</Text>
      </View>
    );
  }

  if (error || !weather) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surfaceAlt, borderRadius: 16, padding: 16, marginBottom: 20 }}>
        <CloudAlert color={c.textSecondary} size={18} />
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary, flex: 1 }}>
          Weather data isn't available for this destination right now.
        </Text>
      </View>
    );
  }

  const color = c[SEVERITY_COLOR[weather.severity]];

  return (
    <View style={{ backgroundColor: withOpacity(color, 0.08), borderWidth: 1.5, borderColor: withOpacity(color, 0.3), borderRadius: 16, padding: 16, marginBottom: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 22 }}>{weather.emoji}</Text>
          <View>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>Weather Alert</Text>
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>
              {weather.condition} · {Math.round(weather.tempC)}°C · Wind {Math.round(weather.windKph)} km/h
            </Text>
          </View>
        </View>
      </View>
      <View style={{ alignSelf: "flex-start", backgroundColor: withOpacity(color, 0.15), borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color }}>{weather.verdict}</Text>
      </View>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10, color: c.textMuted, marginTop: 8 }}>
        Live conditions via Open-Meteo · this verdict is a simple guideline, not an official travel advisory.
      </Text>
    </View>
  );
}

function SafetySection({ title, children, c }: { title: string; children: React.ReactNode; last?: boolean; c: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary, marginBottom: 10 }}>{title}</Text>
      <View style={{ gap: 8 }}>{children}</View>
    </View>
  );
}

function IconRow({ icon, text, bg, c }: { icon: React.ReactNode; text: string; bg: string; c: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: bg, borderRadius: 12, padding: 12 }}>
      {icon}
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textPrimary, flex: 1 }}>{text}</Text>
    </View>
  );
}

function Tags({ title, color, items }: { title: string; color: string; items: string[] }) {
  // marginBottom matches SafetySection's 20 above so "Safe Zones" and
  // "Avoid After Dark" keep the same block rhythm as the sections above
  // them instead of visibly tightening up at the bottom of the tab.
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color, marginBottom: 10 }}>{title}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {items.map((z) => (
          <View key={z} style={{ backgroundColor: withOpacity(color, 0.12), borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 11, color }}>{z}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
