import { View, Text } from "react-native";
import { Banknote, Phone, Wifi, HeartPulse, Globe, AlertTriangle, IndianRupee, Zap, type LucideIcon } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import type { JourneyGuide } from "@/data/journeyGuides";
import { useResolvedScheme, useThemeColors } from "@/theme/useThemeColors";
import { rgba } from "./shared";

// This row list uses a wider, one-off "category rainbow" of accent colors
// (not the shared primary/teal/gold palette), so each needs its own
// lightened dark-mode variant rather than reusing theme tokens — the
// light-mode hexes here are all too dark to read as text on a near-black
// background.
const ESSENTIAL_COLORS = {
  indigo: { light: "#333C81", dark: "#8891E0" },
  teal: { light: "#0D5C63", dark: "#4FC3CC" },
  violet: { light: "#7C3AED", dark: "#A78BFA" },
  red: { light: "#DC2626", dark: "#F87171" },
  sky: { light: "#0EA5E9", dark: "#7DD3FC" },
  amber: { light: "#D97706", dark: "#FBBF24" },
  green: { light: "#15803D", dark: "#4ADE80" },
  slate: { light: "#64748B", dark: "#A8B3C4" },
} as const;

export default function EssentialsSection({ destination: d, guide }: { destination: Destination; guide?: JourneyGuide }) {
  const c = useThemeColors();
  const scheme = useResolvedScheme();
  const color = (key: keyof typeof ESSENTIAL_COLORS) => ESSENTIAL_COLORS[key][scheme];

  return (
    // gap: 16 — see HurdlesSection's note; kept uniform across all six
    // How to Reach sub-tabs.
    <View style={{ gap: 16 }}>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary }}>
        Practical info you need to function confidently in {d.name}.
      </Text>

      {guide ? (
        <>
          <EssentialRow icon={Banknote} label="ATM & Cash" value={guide.cityEssentials.atm} color={color("indigo")} c={c} />
          <EssentialRow icon={Phone} label="SIM Card" value={guide.cityEssentials.sim} color={color("teal")} c={c} />
          <EssentialRow icon={Wifi} label="Internet & WiFi" value={guide.cityEssentials.wifi} color={color("violet")} c={c} />
          <EssentialRow icon={HeartPulse} label="Medical Help" value={guide.cityEssentials.medical} color={color("red")} c={c} />
          <EssentialRow icon={Globe} label="Language Tips" value={guide.cityEssentials.language} color={color("sky")} c={c} />
          <EssentialRow icon={AlertTriangle} label="Emergency Numbers" value={guide.cityEssentials.localEmergency} color={color("amber")} c={c} />
          <EssentialRow icon={IndianRupee} label="UPI & Payments" value={guide.cityEssentials.upi} color={color("green")} c={c} />
          <EssentialRow icon={Zap} label="Power & Adapters" value={guide.cityEssentials.powerOutlet} color={color("slate")} c={c} />
        </>
      ) : (
        d.localTransport.map((lt) => (
          <View
            key={lt.mode}
            style={{
              flexDirection: "row", alignItems: "center", justifyContent: "space-between",
              backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 14,
            }}
          >
            <View>
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>{lt.mode}</Text>
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{lt.notes}</Text>
            </View>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.primary }}>{lt.cost}</Text>
          </View>
        ))
      )}
    </View>
  );
}

function EssentialRow({ icon: Icon, label, value, color, c }: { icon: LucideIcon; label: string; value: string; color: string; c: ReturnType<typeof useThemeColors> }) {
  return (
    <View
      style={{
        flexDirection: "row", gap: 12,
        backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 14,
      }}
    >
      <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: rgba(color, 0.15), alignItems: "center", justifyContent: "center" }}>
        <Icon color={color} size={16} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color, marginBottom: 3 }}>{label}</Text>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textPrimary }}>{value}</Text>
      </View>
    </View>
  );
}
