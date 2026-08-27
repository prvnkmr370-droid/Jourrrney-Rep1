/**
 * Source of truth: Figma "5.5 Settings & Privacy Policy". "Export my
 * data" has no real data-export pipeline behind it (no backend to export
 * from yet) — it surfaces a plain confirmation rather than silently doing
 * nothing. Notification rows open the OS notification settings for this
 * app, since there's no in-app notification permission API to toggle
 * directly.
 */
import { View, Text, Pressable, ScrollView, Alert, Linking } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import { useProfileStore } from "@/store/useProfileStore";
import { useThemeColors } from "@/theme/useThemeColors";

interface Props {
  onBack: () => void;
}

export default function SettingsPrivacy({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const { isSignedIn, signOut } = useProfileStore();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Pressable onPress={onBack} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft color={c.textPrimary} size={18} />
        </Pressable>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 18, color: c.textPrimary }}>Settings & Privacy</Text>
      </View>

      <SectionLabel c={c}>ACCOUNT</SectionLabel>
      <View style={{ gap: 10, marginBottom: 24 }}>
        <Row
          title={isSignedIn ? "Sign out" : "Sign in / Create account"}
          onPress={() => (isSignedIn ? signOut() : router.push("/onboarding"))}
          c={c}
        />
        <Row
          title="Export my data"
          onPress={() => Alert.alert("Export my data", "This is a placeholder — no real data export is wired up yet.")}
          c={c}
        />
      </View>

      <SectionLabel c={c}>NOTIFICATIONS</SectionLabel>
      <View style={{ gap: 10, marginBottom: 24 }}>
        <StatusRow title="Push notifications" status="On" onPress={() => Linking.openSettings()} c={c} />
        <StatusRow title="Trip reminders" status="On" onPress={() => Linking.openSettings()} c={c} />
      </View>

      <SectionLabel c={c}>LEGAL</SectionLabel>
      <View style={{ gap: 10, marginBottom: 24 }}>
        <Row title="Privacy Policy" onPress={() => router.push("/profile/legal/privacy")} c={c} />
        <Row title="Terms of Service" onPress={() => router.push("/profile/legal/terms")} c={c} />
        <Row title="Data we collect and why" onPress={() => router.push("/profile/legal/data")} c={c} />
      </View>

      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, lineHeight: 16, color: c.textMuted }}>
        Journey never asks for payment or booking details — this app is a guide, not a marketplace.
      </Text>
    </ScrollView>
  );
}

function SectionLabel({ children, c }: { children: React.ReactNode; c: ReturnType<typeof useThemeColors> }) {
  return (
    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, letterSpacing: 1, color: c.textSecondary, marginBottom: 10 }}>
      {children}
    </Text>
  );
}

function Row({ title, onPress, c }: { title: string; onPress: () => void; c: ReturnType<typeof useThemeColors> }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16 }}
    >
      <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 14, color: c.textPrimary }}>{title}</Text>
      <ChevronRight color={c.textMuted} size={16} />
    </Pressable>
  );
}

function StatusRow({ title, status, onPress, c }: { title: string; status: string; onPress: () => void; c: ReturnType<typeof useThemeColors> }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16 }}
    >
      <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 14, color: c.textPrimary }}>{title}</Text>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textSecondary }}>{status}</Text>
    </Pressable>
  );
}
