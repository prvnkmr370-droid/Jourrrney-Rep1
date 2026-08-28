/**
 * Ported from the Make prototype's SettingsTab, with the rows that
 * overlap earlier-built screens merged into those real screens instead
 * of being duplicated as disconnected toggles:
 *  - "Safety alerts" now opens Safety Guard Setup (its real toggles live
 *    there — curfew/area alerts, live location sharing).
 *  - "Offline maps" now opens Offline Maps & Guides (the real per-guide
 *    download list) instead of being a single unconnected boolean.
 *  - "Login & security" opens Settings & Privacy (sign in/out lives
 *    there); "Privacy & sharing" opens the Privacy Policy document.
 * "Notifications" stays a simple local toggle — there's no notification
 * backend, so it's intentionally inert beyond its own screen.
 *
 * "Dark mode" is a real 3-way System/Light/Dark control backed by
 * useThemeStore — a plain on/off Switch can't represent "follow system"
 * (the default), so this is a segmented control, same visual pattern as
 * Budget tab's tier selector. For a real (email) account, picking a mode
 * also persists to journey-backend via useProfileStore.setThemeMode, so
 * the choice follows the account across reinstalls/devices — for guests
 * and the fake Google/Apple/Facebook accounts it still applies instantly,
 * just without that cross-device sync (no backend account to save it to).
 */
import { useState } from "react";
import { View, Text, Pressable, Switch, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { Bell, Shield, Globe, Lock, FileText, ChevronRight, type LucideIcon } from "lucide-react-native";
import { useProfileStore } from "@/store/useProfileStore";
import { useThemeStore, type ThemeMode } from "@/store/useThemeStore";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";

const MODE_OPTIONS: { id: ThemeMode; label: string }[] = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

export default function SettingsTab() {
  const c = useThemeColors();
  const { isSignedIn, signOut, setThemeMode } = useProfileStore();
  const mode = useThemeStore((s) => s.mode);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = async () => {
    // signOut() now also clears the real session token from SecureStore,
    // so it's worth waiting for before navigating away.
    await signOut();
    router.replace("/(tabs)");
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, overflow: "hidden" }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, letterSpacing: 1, color: c.textSecondary, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
          PREFERENCES
        </Text>

        <ToggleRow icon={Bell} label="Notifications" sub="Trip reminders & alerts" value={notifications} onValueChange={setNotifications} c={c} />
        <NavRow icon={Shield} label="Safety alerts" sub="Women safety tips per destination" onPress={() => router.push("/profile/safety-guard")} c={c} />
        <NavRow icon={Globe} label="Offline maps" sub="Save maps without data" onPress={() => router.push("/profile/offline-maps")} c={c} />

        <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: c.borderSoft }}>
          <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary, marginBottom: 2 }}>Appearance</Text>
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary, marginBottom: 10 }}>
            "System" matches your phone's own setting
          </Text>
          <View style={{ flexDirection: "row", gap: 6, backgroundColor: c.surfaceAlt, borderRadius: 12, padding: 4 }}>
            {MODE_OPTIONS.map((opt) => {
              const active = mode === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setThemeMode(opt.id)}
                  style={{ flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 9, backgroundColor: active ? c.primary : "transparent" }}
                >
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: active ? "#FFFFFF" : c.textSecondary }}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, overflow: "hidden" }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, letterSpacing: 1, color: c.textSecondary, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
          ACCOUNT
        </Text>
        <NavRow icon={Lock} label="Login & security" sub="Sign in, password, sessions" onPress={() => router.push("/profile/settings")} c={c} />
        <NavRow icon={Shield} label="Privacy & sharing" sub="Control what you share" onPress={() => router.push("/profile/legal/privacy")} c={c} />
        <NavRow
          icon={FileText}
          label="Travel documents"
          sub="ID, passport, visa info"
          onPress={() => Alert.alert("Travel documents", "This is a placeholder — no real document storage is wired up yet.")}
          c={c}
        />
      </View>

      {isSignedIn && (
        <Pressable onPress={handleLogout} style={{ borderWidth: 1.5, borderColor: "rgba(220,38,38,0.25)", borderRadius: 16, paddingVertical: 14, alignItems: "center" }}>
          <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.danger }}>Log out</Text>
        </Pressable>
      )}

      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textMuted, textAlign: "center" }}>
        Jourrrney · v1.0.0
      </Text>
    </ScrollView>
  );
}

function ToggleRow({ icon: Icon, label, sub, value, onValueChange, c }: { icon: LucideIcon; label: string; sub: string; value: boolean; onValueChange: (v: boolean) => void; c: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: c.borderSoft }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: withOpacity(c.teal, 0.12), alignItems: "center", justifyContent: "center" }}>
        <Icon color={c.teal} size={16} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary }}>{label}</Text>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{sub}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: c.primary, false: "#D6D3D1" }} thumbColor="#FFFFFF" />
    </View>
  );
}

function NavRow({ icon: Icon, label, sub, onPress, c }: { icon: LucideIcon; label: string; sub: string; onPress: () => void; c: ReturnType<typeof useThemeColors> }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: c.borderSoft }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: withOpacity(c.teal, 0.12), alignItems: "center", justifyContent: "center" }}>
        <Icon color={c.teal} size={16} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary }}>{label}</Text>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{sub}</Text>
      </View>
      <ChevronRight color={c.textMuted} size={16} />
    </Pressable>
  );
}
