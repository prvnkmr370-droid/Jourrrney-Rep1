/** Small shared building blocks used across the journey-guide sections. */
import { View, Text } from "react-native";
import { CheckCircle } from "lucide-react-native";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";

export function Card({ children, borderColor }: { children: React.ReactNode; borderColor?: string }) {
  const c = useThemeColors();
  return (
    <View
      style={{
        backgroundColor: c.surface, borderRadius: 16,
        borderWidth: 1, borderColor: borderColor ?? c.border,
        overflow: "hidden",
      }}
    >
      {children}
    </View>
  );
}

export function SectionLabel({ children, color }: { children: React.ReactNode; color?: string }) {
  const c = useThemeColors();
  return (
    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, letterSpacing: 1, color: color ?? c.textPrimary, marginBottom: 10, textTransform: "uppercase" }}>
      {children}
    </Text>
  );
}

export function Bullet({ text, color, dotColor }: { text: string; color?: string; dotColor?: string }) {
  const c = useThemeColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
      <Text style={{ fontSize: 12, color: dotColor ?? color ?? c.textSecondary, marginTop: 1 }}>•</Text>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: c.textPrimary, flex: 1 }}>{text}</Text>
    </View>
  );
}

export function CheckItem({ text }: { text: string }) {
  const c = useThemeColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <CheckCircle color={c.success} size={14} />
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textPrimary, flex: 1 }}>{text}</Text>
    </View>
  );
}

export function Callout({ icon, text, bg }: { icon: string; text: string; bg: string }) {
  const c = useThemeColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: bg, borderRadius: 12, padding: 12 }}>
      <Text style={{ fontSize: 13 }}>{icon}</Text>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: c.textPrimary, flex: 1 }}>{text}</Text>
    </View>
  );
}

export function NumberBadge({ n, color = "#333C81" }: { n: number; color?: string }) {
  return (
    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: "#FFFFFF" }}>{n}</Text>
    </View>
  );
}

export const rgba = withOpacity;
