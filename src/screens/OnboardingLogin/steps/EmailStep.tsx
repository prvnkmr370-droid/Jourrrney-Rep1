import { View, Text, Pressable, TextInput, ActivityIndicator, Linking } from "react-native";
import { X } from "lucide-react-native";
import { CompassMark } from "@/components/JourrrneyLogo";
import { FacebookIcon } from "@/components/icons/BrandIcons";
import { API_BASE_URL } from "@/config/api";
import type { AuthProvider } from "@/store/useProfileStore";

// Only sign-in methods that really work are shown. "Sign in with Google" and "Sign in with Apple" are
// left out on purpose: they used to just mark the phone as signed in without creating an account, and a
// button that does nothing real is what app stores reject. When one is wired up for real (see
// useProfileStore.signIn), add its entry back here: GoogleIcon and AppleIcon are still in BrandIcons.
const SOCIAL_BUTTONS: { provider: Exclude<AuthProvider, null>; label: string; icon: React.ReactNode }[] = [
  { provider: "facebook", label: "Sign in with Facebook", icon: <FacebookIcon size={20} /> },
];

interface Props {
  email: string;
  onEmailChange: (v: string) => void;
  onContinueWithEmail: () => void;
  onSocial: (provider: Exclude<AuthProvider, null>) => void;
  onSkip: () => void;
  /** True while requestCode() is in flight against journey-backend. */
  loading?: boolean;
  /** The social button whose sign-in is being opened (it shows "Opening…" and the others pause). */
  busyProvider?: Exclude<AuthProvider, null> | null;
  /** Set when requestCode() fails — e.g. the backend isn't reachable. */
  error?: string | null;
  /** Set when a social sign-in could not start. Shown right under the social buttons, where the person just tapped. */
  socialError?: string | null;
  topInset: number;
  bottomInset: number;
}

export default function EmailStep({ email, onEmailChange, onContinueWithEmail, onSocial, onSkip, loading, busyProvider, error, socialError, topInset, bottomInset }: Props) {
  const canContinue = email.trim().length > 0 && !loading;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: topInset + 12 }}>
        <Pressable onPress={onSkip} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <X color="#FFFFFF" size={22} />
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Skip</Text>
        </Pressable>
        <CompassMark size={32} />
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 28 }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 28, lineHeight: 34, color: "#FFFFFF", marginBottom: 12 }}>
          Sign in or create{"\n"}an account
        </Text>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: "rgba(255,255,255,0.6)", marginBottom: 28 }}>
          Unlock personalised trip planning, saved itineraries, and safety tools across Jourrrney.
        </Text>

        <TextInput
          value={email}
          onChangeText={onEmailChange}
          placeholder="Email"
          placeholderTextColor="rgba(255,255,255,0.4)"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
          style={{
            height: 52, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", borderRadius: 999, paddingHorizontal: 20,
            fontFamily: "Poppins_400Regular", fontSize: 14, color: "#FFFFFF", marginBottom: error ? 8 : 16,
          }}
        />

        {error && (
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: "#F87171", marginBottom: 16, lineHeight: 17 }}>
            {error}
          </Text>
        )}

        <Pressable
          onPress={onContinueWithEmail}
          disabled={!canContinue}
          style={{
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
            backgroundColor: canContinue ? "#FBF7F2" : "rgba(255,255,255,0.15)", borderRadius: 999, paddingVertical: 16, marginBottom: 24,
          }}
        >
          {loading && <ActivityIndicator color="#333C81" size="small" />}
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: canContinue ? "#333C81" : "rgba(255,255,255,0.5)" }}>
            {loading ? "Sending code…" : "Continue"}
          </Text>
        </Pressable>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
          <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
        </View>

        <View style={{ gap: 12, marginBottom: 24 }}>
          {SOCIAL_BUTTONS.map((btn) => {
            const busy = busyProvider === btn.provider;
            return (
              <Pressable
                key={btn.provider}
                onPress={() => onSocial(btn.provider)}
                disabled={!!busyProvider}
                accessibilityRole="button"
                accessibilityLabel={busy ? "Opening Facebook" : btn.label}
                style={{
                  flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
                  borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", borderRadius: 999, paddingVertical: 15,
                  opacity: busyProvider && !busy ? 0.5 : 1,
                }}
              >
                {busy ? <ActivityIndicator color="#FFFFFF" size="small" /> : btn.icon}
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: "#FFFFFF" }}>{busy ? "Opening Facebook…" : btn.label}</Text>
              </Pressable>
            );
          })}
          {socialError && (
            <View
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
              style={{ borderWidth: 1, borderColor: "rgba(248,113,113,0.6)", backgroundColor: "rgba(248,113,113,0.12)", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }}
            >
              <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, lineHeight: 21, color: "#FFFFFF" }}>{socialError}</Text>
            </View>
          )}
        </View>

        {/* The two links open the public web pages (the same words as Profile > Settings), so a
            person can read them before they have an account. */}
        <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 19, color: "rgba(255,255,255,0.6)" }}>
          By continuing, you agree to Jourrrney's{" "}
          <Text
            accessibilityRole="link"
            onPress={() => Linking.openURL(`${API_BASE_URL}/terms`)}
            style={{ color: "#A9B1F5", textDecorationLine: "underline" }}
          >
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text
            accessibilityRole="link"
            onPress={() => Linking.openURL(`${API_BASE_URL}/privacy`)}
            style={{ color: "#A9B1F5", textDecorationLine: "underline" }}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>

      <View style={{ alignItems: "center", paddingBottom: Math.max(bottomInset, 20) }}>
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 2 }}>
          JOURRRNEY
        </Text>
      </View>
    </View>
  );
}
