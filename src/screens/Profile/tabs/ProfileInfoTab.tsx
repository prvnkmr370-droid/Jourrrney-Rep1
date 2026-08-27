/**
 * Ported from the Make prototype's ProfileTab. Bio editing is session-
 * only (no backend to persist to). "Travel style" navigates to the real
 * Travel Preferences screen — the Make code left every personal-info row
 * as an inert no-op (`onTap={() => {}}`), but since a real screen for that
 * one exists from an earlier phase, wiring it up is a genuine improvement
 * over the reference rather than a deviation from it. The other rows
 * (Work, Education, Languages, Lives in) stay display-only, same as the
 * Make code — there's nothing real for them to open yet. Rows that don't
 * navigate are rendered as plain (non-Pressable) Views with no chevron, so
 * their appearance matches what tapping them actually does — previously
 * every row looked identically tappable regardless of whether anything
 * happened.
 *
 * This whole tab is gated on isSignedIn: it's Priya Sharma's static demo
 * data, and showing it to a guest (who the header elsewhere correctly
 * labels "Guest") looked like the app was displaying a stranger's account.
 */
import { useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView } from "react-native";
import { router } from "expo-router";
import { Edit3, Briefcase, GraduationCap, Languages, Heart, MapPin, Phone, Mail, FileText, Check, ChevronRight, UserRound, type LucideIcon } from "lucide-react-native";
import { useProfileStore } from "@/store/useProfileStore";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";
import { USER } from "../mockUser";

export default function ProfileInfoTab() {
  const c = useThemeColors();
  const isSignedIn = useProfileStore((s) => s.isSignedIn);
  const [editBio, setEditBio] = useState(false);
  const [bio, setBio] = useState(USER.bio);
  const [draft, setDraft] = useState(USER.bio);

  const personalInfo: { icon: LucideIcon; label: string; value: string; onPress?: () => void }[] = [
    { icon: Briefcase, label: "Work", value: USER.work },
    { icon: GraduationCap, label: "Education", value: USER.school },
    { icon: Languages, label: "Languages", value: USER.languages.join(", ") },
    { icon: Heart, label: "Travel style", value: USER.travelStyle, onPress: () => router.push("/profile/travel-preferences") },
    { icon: MapPin, label: "Lives in", value: USER.location },
  ];

  const verifiedInfo = [
    { icon: Phone, label: USER.phone, verified: USER.verified.phone },
    { icon: Mail, label: USER.email, verified: USER.verified.email },
    { icon: FileText, label: "Government ID", verified: USER.verified.govId },
  ];

  if (!isSignedIn) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <UserRound color={c.textSecondary} size={26} />
        </View>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary, textAlign: "center", marginBottom: 6 }}>
          No profile yet
        </Text>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary, textAlign: "center", lineHeight: 18, marginBottom: 20 }}>
          Sign in to build out your bio, personal info, and verification status.
        </Text>
        <Pressable
          onPress={() => router.push("/profile/sign-in")}
          style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#333C81", borderRadius: 999, paddingHorizontal: 20, paddingVertical: 12 }}
        >
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: "#FFFFFF" }}>Sign in</Text>
          <ChevronRight color="#FFFFFF" size={14} />
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, letterSpacing: 1, color: c.textSecondary }}>ABOUT</Text>
          {!editBio && (
            <Pressable onPress={() => { setDraft(bio); setEditBio(true); }} style={{ backgroundColor: c.surfaceAlt, borderRadius: 8, padding: 6 }}>
              <Edit3 color={c.textSecondary} size={13} />
            </Pressable>
          )}
        </View>

        {editBio ? (
          <View>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              multiline
              numberOfLines={4}
              style={{ backgroundColor: c.surfaceAlt, borderRadius: 12, padding: 12, fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textPrimary, lineHeight: 19, borderWidth: 1.5, borderColor: "#333C81", minHeight: 90, textAlignVertical: "top" }}
            />
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <Pressable onPress={() => { setBio(draft); setEditBio(false); }} style={{ flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12, backgroundColor: "#333C81" }}>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: "#FFFFFF" }}>Save</Text>
              </Pressable>
              <Pressable onPress={() => setEditBio(false)} style={{ flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12, backgroundColor: c.surfaceAlt }}>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textSecondary }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20, color: c.textPrimary }}>{bio}</Text>
        )}
      </View>

      <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, overflow: "hidden" }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, letterSpacing: 1, color: c.textSecondary, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
          PERSONAL INFO
        </Text>
        {personalInfo.map((row, i) => {
          const rowContent = (
            <>
              <row.icon color={c.textSecondary} size={16} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{row.label}</Text>
                <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary, marginTop: 1 }}>{row.value}</Text>
              </View>
              {row.onPress && <ChevronRight color={c.textMuted} size={16} />}
            </>
          );
          const rowStyle = { flexDirection: "row" as const, alignItems: "center" as const, gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: c.borderSoft };
          // Only rows with a real destination are Pressable — the rest are
          // plain Views so they don't show a pressed state for a tap that
          // does nothing.
          return row.onPress ? (
            <Pressable key={row.label} onPress={row.onPress} style={rowStyle}>
              {rowContent}
            </Pressable>
          ) : (
            <View key={row.label} style={rowStyle}>
              {rowContent}
            </View>
          );
        })}
      </View>

      <View style={{ backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, overflow: "hidden" }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, letterSpacing: 1, color: c.textSecondary, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
          VERIFIED INFO
        </Text>
        {verifiedInfo.map((row, i) => (
          <View
            key={row.label}
            style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: c.borderSoft }}
          >
            <row.icon color={c.textSecondary} size={16} />
            <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 13, color: c.textPrimary, flex: 1 }}>{row.label}</Text>
            {/* Unverified now reads as a static status ("Not Verified"),
                not a "Verify" CTA — there's no real verification flow
                behind it, so it shouldn't look like a working button. */}
            <View
              style={{
                flexDirection: "row", alignItems: "center", gap: 4,
                backgroundColor: row.verified ? withOpacity(c.teal, 0.12) : withOpacity(c.textSecondary, 0.12),
                borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
              }}
            >
              {row.verified && <Check color={c.primary} size={11} />}
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: row.verified ? c.primary : c.textSecondary }}>
                {row.verified ? "Verified" : "Not verified"}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
