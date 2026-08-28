/**
 * Ported from the Make prototype's ProfileTab. Bio, Work, Education,
 * Languages, and Lives in are now real — persisted to journey-backend's
 * /profile endpoint for real (email) accounts, via useProfileStore's
 * profile/updateProfile. Google/Apple/Facebook sign-in is still local-only
 * fake auth, so those accounts keep showing the static demo persona
 * (Priya Sharma) rather than empty real fields that don't exist for them.
 *
 * "Travel style" now reads from useTravelPreferencesStore — a genuine
 * local feature (not demo data), shared with the Travel Preferences
 * screen — instead of the mock persona's static "Backpacker" text.
 *
 * This whole tab is gated on isSignedIn: showing either the real profile
 * or the demo persona to a guest (who the header elsewhere correctly
 * labels "Guest") looked like the app was displaying a stranger's account.
 */
import { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Edit3, Briefcase, GraduationCap, Languages, Heart, MapPin, Phone, Mail, FileText, Check, ChevronRight, UserRound, type LucideIcon } from "lucide-react-native";
import { useProfileStore } from "@/store/useProfileStore";
import { useTravelPreferencesStore, type TravelStyle } from "@/store/useTravelPreferencesStore";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";
import { USER } from "../mockUser";

const TRAVEL_STYLE_LABEL: Record<TravelStyle, string> = {
  slow: "Slow travel",
  packed: "Packed itinerary",
  mixed: "Mix of both",
};

const NOT_SET = "Not set yet";

export default function ProfileInfoTab() {
  const c = useThemeColors();
  const { isSignedIn, authProvider, email, profile, updateProfile, fetchProfile } = useProfileStore();
  const travelStyle = useTravelPreferencesStore((s) => s.travelStyle);
  // "email" means a real journey-backend account — everything else
  // (Google/Apple/Facebook) is still local-only fake auth with no real
  // profile behind it, so those keep the demo persona.
  const isRealAccount = authProvider === "email";

  const [editBio, setEditBio] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn && isRealAccount) fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, isRealAccount]);

  const bio = isRealAccount ? profile.bio : USER.bio;

  const personalInfo: { icon: LucideIcon; label: string; value: string; onPress?: () => void }[] = isRealAccount
    ? [
        { icon: Briefcase, label: "Work", value: profile.work ?? NOT_SET },
        { icon: GraduationCap, label: "Education", value: profile.education ?? NOT_SET },
        { icon: Languages, label: "Languages", value: profile.languages ?? NOT_SET },
        { icon: Heart, label: "Travel style", value: TRAVEL_STYLE_LABEL[travelStyle], onPress: () => router.push("/profile/travel-preferences") },
        { icon: MapPin, label: "Lives in", value: profile.location ?? NOT_SET },
      ]
    : [
        { icon: Briefcase, label: "Work", value: USER.work },
        { icon: GraduationCap, label: "Education", value: USER.school },
        { icon: Languages, label: "Languages", value: USER.languages.join(", ") },
        { icon: Heart, label: "Travel style", value: TRAVEL_STYLE_LABEL[travelStyle], onPress: () => router.push("/profile/travel-preferences") },
        { icon: MapPin, label: "Lives in", value: USER.location },
      ];

  // Real accounts show their actual email — genuinely "verified" in the
  // sense that matters here, since signing in required entering a code
  // sent to that exact address. No phone number is collected anywhere in
  // the app, so that row is dropped rather than showing a fabricated one;
  // Government ID has no real verification flow for anyone yet.
  const verifiedInfo = isRealAccount
    ? [
        { icon: Mail, label: email ?? "", verified: true },
        { icon: FileText, label: "Government ID", verified: false },
      ]
    : [
        { icon: Phone, label: USER.phone, verified: USER.verified.phone },
        { icon: Mail, label: USER.email, verified: USER.verified.email },
        { icon: FileText, label: "Government ID", verified: USER.verified.govId },
      ];

  const handleSaveBio = async () => {
    if (!isRealAccount) {
      // No backend behind the fake social-login personas — same
      // session-only behavior as before.
      setEditBio(false);
      return;
    }
    setSaving(true);
    setSaveError(null);
    const result = await updateProfile({ bio: draft });
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error ?? "Couldn't save — try again.");
      return;
    }
    setEditBio(false);
  };

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
            <Pressable onPress={() => { setDraft(bio ?? ""); setSaveError(null); setEditBio(true); }} style={{ backgroundColor: c.surfaceAlt, borderRadius: 8, padding: 6 }}>
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
              editable={!saving}
              placeholder="Tell other travellers a bit about yourself"
              placeholderTextColor={c.textMuted}
              style={{ backgroundColor: c.surfaceAlt, borderRadius: 12, padding: 12, fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textPrimary, lineHeight: 19, borderWidth: 1.5, borderColor: "#333C81", minHeight: 90, textAlignVertical: "top" }}
            />
            {saveError && (
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.danger, marginTop: 8 }}>{saveError}</Text>
            )}
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <Pressable onPress={handleSaveBio} disabled={saving} style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: "#333C81" }}>
                {saving && <ActivityIndicator color="#FFFFFF" size="small" />}
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: "#FFFFFF" }}>{saving ? "Saving…" : "Save"}</Text>
              </Pressable>
              <Pressable onPress={() => setEditBio(false)} disabled={saving} style={{ flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12, backgroundColor: c.surfaceAlt }}>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textSecondary }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20, color: bio ? c.textPrimary : c.textMuted }}>
            {bio ?? "Add a bio so other travellers know a bit about you."}
          </Text>
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
                <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: row.value === NOT_SET ? c.textMuted : c.textPrimary, marginTop: 1 }}>{row.value}</Text>
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
