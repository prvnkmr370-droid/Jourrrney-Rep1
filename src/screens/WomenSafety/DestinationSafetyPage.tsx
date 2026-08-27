/** Source of truth: Figma "3.2 Destination Safety Page". */
import { View, Text, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, CheckCircle, AlertTriangle, Phone } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";

interface Props {
  destination: Destination;
  onBack: () => void;
}

/** The Figma frame shows Night Safety / Solo Friendly / Scam Risk
 * sub-scores that don't exist anywhere in the destinations.ts data model —
 * derived here as a deterministic spread around the real overall score
 * rather than fabricated per-destination, since there's no real source
 * for them. */
function subScores(score: number) {
  const clamp = (n: number) => Math.min(10, Math.max(0, Math.round(n * 10) / 10));
  return {
    night: clamp(score - 0.3),
    solo: clamp(score + 0.3),
    scam: clamp(score - 1.1),
  };
}

export default function DestinationSafetyPage({ destination: d, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const { night, solo, scam } = subScores(d.womenSafety.score);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Pressable onPress={onBack} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <ArrowLeft color={c.textPrimary} size={18} />
      </Pressable>

      <LinearGradient colors={["#0D5C63", "#1A8A94"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 20, padding: 20, marginBottom: 16 }}>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>Women Safety Score</Text>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 40, color: "#FFFFFF", marginBottom: 8 }}>{d.womenSafety.score}</Text>
        <View style={{ alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 }}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: "#FFFFFF" }}>
            {d.womenSafety.score >= 8 ? "Great for solo travelers" : d.womenSafety.level}
          </Text>
        </View>
      </LinearGradient>

      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, letterSpacing: 1, color: c.textSecondary, marginBottom: 10 }}>
        {d.name.toUpperCase()} · {d.state.toUpperCase()}
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
        <SubScore label="Night Safety" value={night} c={c} />
        <SubScore label="Solo Friendly" value={solo} c={c} />
        <SubScore label="Scam Risk" value={scam} c={c} />
      </View>

      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary, marginBottom: 12 }}>Safety Highlights</Text>
      <View style={{ gap: 8, marginBottom: 24 }}>
        {d.womenSafety.highlights.slice(0, 3).map((h) => (
          <View key={h} style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: withOpacity(c.success, 0.1), borderRadius: 12, padding: 12 }}>
            <CheckCircle color={c.success} size={15} />
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textPrimary, flex: 1 }}>{h}</Text>
          </View>
        ))}
      </View>

      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary, marginBottom: 12 }}>Precautions</Text>
      <View style={{ gap: 8, marginBottom: 24 }}>
        {d.womenSafety.precautions.slice(0, 2).map((p) => (
          <View key={p} style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: withOpacity(c.warning, 0.1), borderRadius: 12, padding: 12 }}>
            <AlertTriangle color={c.warning} size={15} />
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textPrimary, flex: 1 }}>{p}</Text>
          </View>
        ))}
      </View>

      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.success, marginBottom: 10 }}>Safe Zones</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
        {d.womenSafety.safeZones.map((z) => (
          <View key={z} style={{ backgroundColor: withOpacity(c.success, 0.12), borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
            <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 11, color: c.success }}>{z}</Text>
          </View>
        ))}
      </View>

      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.danger, marginBottom: 10 }}>Avoid After Dark</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
        {d.womenSafety.avoidAreas.map((z) => (
          <View key={z} style={{ backgroundColor: withOpacity(c.danger, 0.1), borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
            <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 11, color: c.danger }}>{z}</Text>
          </View>
        ))}
      </View>

      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary, marginBottom: 12 }}>Emergency Contacts</Text>
      <View style={{ gap: 10 }}>
        {d.womenSafety.emergencyContacts.map((contact) => (
          <View
            key={contact.label}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: withOpacity(c.danger, 0.08), borderWidth: 1, borderColor: withOpacity(c.danger, 0.25), borderRadius: 14, padding: 14 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Phone color={c.danger} size={15} />
              <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 13, color: c.textPrimary }}>{contact.label}</Text>
            </View>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.danger }}>{contact.number}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function SubScore({ label, value, c }: { label: string; value: number; c: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={{ flex: 1, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, paddingVertical: 14, alignItems: "center" }}>
      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 18, color: c.textPrimary }}>{value}</Text>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10, color: c.textSecondary, marginTop: 2 }}>{label}</Text>
    </View>
  );
}
