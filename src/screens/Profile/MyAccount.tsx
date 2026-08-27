/**
 * No Figma frame — ported from the Make prototype's ProfileScreen.tsx
 * ("My Account": header + Searches/Profile/Settings tabs), per reference
 * screenshots the user supplied. Replaces the earlier Figma-based
 * "5.1 Profile Hub" entirely as the /profile destination.
 *
 * USER is the same static demo persona the Make code hardcodes (Priya
 * Sharma) — it's mock data there too, not something this port is faking
 * on top of a real feature. The header still reflects real auth state
 * (guest vs signed-in) via useProfileStore, and several rows that were
 * inert no-ops in the Make code now route to real screens built in
 * earlier phases (Safety Guard Setup, Travel Preferences, Offline Maps,
 * Settings & Privacy) instead of duplicating that functionality here.
 */
import { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Camera, MapPin, Search, User, Settings, ChevronRight, UserRound } from "lucide-react-native";
import { useProfileStore } from "@/store/useProfileStore";
import { useThemeColors } from "@/theme/useThemeColors";
import { USER } from "./mockUser";

import SearchesTab from "./tabs/SearchesTab";
import ProfileInfoTab from "./tabs/ProfileInfoTab";
import SettingsTab from "./tabs/SettingsTab";

const STATS = [
  { value: 3, label: "Trips" },
  { value: 2, label: "Upcoming" },
  { value: 7, label: "Saved" },
];

type Section = "searches" | "profile" | "settings";
// Search and User read more clearly as "search history" and "person" than
// the previous Package/MapPin pair, which leaned toward "orders" and
// "location" — closer to their own tab content but a step removed from
// what a user scanning the tab bar is looking for.
const TABS: { id: Section; label: string; icon: typeof Search }[] = [
  { id: "searches", label: "Searches", icon: Search },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function MyAccount() {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const { isSignedIn } = useProfileStore();
  const [section, setSection] = useState<Section>("searches");

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.border, paddingTop: insets.top + 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, marginBottom: 20 }}>
          <Pressable onPress={() => router.back()} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft color={c.textPrimary} size={16} />
          </Pressable>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 16, color: c.textPrimary }}>My Account</Text>
        </View>

        {/* Everything below the name now consistently checks isSignedIn —
            previously the location line and stat strip kept showing
            Priya's demo data even after the name itself correctly
            switched to "Guest", which made it look like the app was
            showing a stranger's account. */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 20, marginBottom: 20 }}>
          <View>
            <View
              style={{
                width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center",
                backgroundColor: isSignedIn ? "#333C81" : "#D6D3D1",
              }}
            >
              {isSignedIn ? (
                <Text style={{ fontFamily: "Poppins_800ExtraBold", fontSize: 22, color: "#FFFFFF" }}>{USER.avatar}</Text>
              ) : (
                // Fixed dark icon color, not c.textSecondary — the circle
                // behind it is a fixed light gray regardless of theme, so
                // the icon needs to stay dark rather than flip light and
                // wash out against it in dark mode.
                <UserRound color="#78716C" size={26} />
              )}
            </View>
            {/* Previously decorative (no onPress at all) — now at least
                honest about not being wired up yet, same pattern as
                Settings' "Travel documents" row, instead of looking
                tappable and silently doing nothing. */}
            {isSignedIn && (
              <Pressable
                onPress={() => Alert.alert("Profile photo", "This is a placeholder — no real photo upload is wired up yet.")}
                style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: "#1C1917", borderWidth: 2, borderColor: c.surface, alignItems: "center", justifyContent: "center" }}
              >
                <Camera color="#FFFFFF" size={12} />
              </Pressable>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "Poppins_800ExtraBold", fontSize: 18, color: c.textPrimary }}>{isSignedIn ? USER.name : "Guest"}</Text>
            {isSignedIn ? (
              <>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 }}>
                  <MapPin color={c.textSecondary} size={12} />
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary }}>{USER.location}</Text>
                </View>
                <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary, marginTop: 2 }}>
                  Member since {USER.memberSince}
                </Text>
              </>
            ) : (
              <Pressable
                onPress={() => router.push("/profile/sign-in")}
                style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4, alignSelf: "flex-start" }}
              >
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.primary }}>Sign in to save your profile</Text>
                <ChevronRight color={c.primary} size={13} />
              </Pressable>
            )}
          </View>
        </View>

        {isSignedIn && (
          <View style={{ flexDirection: "row", marginHorizontal: 20, marginBottom: 20, backgroundColor: c.bg, borderWidth: 1, borderColor: c.border, borderRadius: 16, overflow: "hidden" }}>
            {STATS.map((s, i) => (
              <View key={s.label} style={{ flex: 1, alignItems: "center", paddingVertical: 12, borderRightWidth: i < STATS.length - 1 ? 1 : 0, borderRightColor: c.border }}>
                <Text style={{ fontFamily: "Poppins_800ExtraBold", fontSize: 20, color: c.textPrimary }}>{s.value}</Text>
                <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary, marginTop: 2 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ flexDirection: "row", paddingHorizontal: 20, gap: 4 }}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = section === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setSection(t.id)}
                style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: active ? c.primary : "transparent" }}
              >
                <Icon color={active ? c.primary : c.textSecondary} size={14} />
                <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: active ? c.primary : c.textSecondary }}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {section === "searches" && <SearchesTab />}
      {section === "profile" && <ProfileInfoTab />}
      {section === "settings" && <SettingsTab />}
    </View>
  );
}
