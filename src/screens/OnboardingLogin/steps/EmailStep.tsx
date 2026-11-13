import { useState } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator, Linking, ScrollView } from "react-native";
import { X } from "lucide-react-native";
import { CompassMark } from "@/components/JourrrneyLogo";
import { GoogleIcon, FacebookIcon } from "@/components/icons/BrandIcons";
import { API_BASE_URL } from "@/config/api";
import { SOCIAL_NAME, isSocialProvider, type AuthProvider } from "@/store/useProfileStore";
import { isEmailLike } from "@/utils/isEmailLike";

const MAX_FONT = 1.3;

// Only sign-in methods that really work are shown. "Sign in with Apple" is left out on purpose: it used
// to just mark the phone as signed in without creating an account, and a button that does nothing real
// is what app stores reject. When it is wired up for real, add its entry back here (AppleIcon is still
// in BrandIcons).
const SOCIAL_BUTTONS: { provider: Exclude<AuthProvider, null>; label: string; icon: React.ReactNode }[] = [
  { provider: "google", label: "Continue with Google", icon: <GoogleIcon size={18} /> },
  { provider: "facebook", label: "Continue with Facebook", icon: <FacebookIcon size={20} /> },
];

const providerName = (provider: Exclude<AuthProvider, null>) => (isSocialProvider(provider) ? SOCIAL_NAME[provider] : provider);

interface Props {
  email: string;
  onEmailChange: (v: string) => void;
  onContinueWithEmail: () => void;
  onSocial: (provider: Exclude<AuthProvider, null>) => void;
  /** "Continue as a guest" and the close button: not now, nothing is lost. */
  onSkip: () => void;
  /** "New to Jourrrney? Create an account": opens the create-account form. */
  onCreateAccount: () => void;
  /** True while requestCode() is in flight against journey-backend. */
  loading?: boolean;
  /** The social button whose sign-in is being opened (it shows "Opening…" and the others pause). */
  busyProvider?: Exclude<AuthProvider, null> | null;
  /** Set when requestCode() fails, in plain words. Shown right under the email box. */
  error?: string | null;
  /** Set when a social sign-in could not start. Shown right under the social buttons, where the person just tapped. */
  socialError?: string | null;
  topInset: number;
  bottomInset: number;
}

export default function EmailStep({ email, onEmailChange, onContinueWithEmail, onSocial, onSkip, onCreateAccount, loading, busyProvider, error, socialError, topInset, bottomInset }: Props) {
  const [touched, setTouched] = useState(false);
  const valid = isEmailLike(email);
  const canContinue = valid && !loading;
  const showFormatHint = touched && email.trim().length > 0 && !valid && !error;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: Math.max(bottomInset, 20) }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: topInset + 8 }}>
        <Pressable
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel="Close and continue as a guest"
          style={{ width: 48, height: 48, marginLeft: -10, alignItems: "center", justifyContent: "center" }}
        >
          <X color="#FFFFFF" size={24} />
        </Pressable>
        <CompassMark size={32} />
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
        <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 28, lineHeight: 34, color: "#FFFFFF", marginBottom: 12 }}>
          Sign in or create{"\n"}an account
        </Text>
        <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 20, color: "rgba(255,255,255,0.68)", marginBottom: 24 }}>
          Save your trips and recent searches, and use AI search that remembers what you like.
        </Text>

        <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12.5, color: "rgba(255,255,255,0.78)", marginBottom: 6, marginLeft: 4 }}>
          Email address
        </Text>
        <TextInput
          value={email}
          onChangeText={onEmailChange}
          onBlur={() => setTouched(true)}
          onSubmitEditing={() => { if (canContinue) onContinueWithEmail(); }}
          placeholder="name@example.com"
          placeholderTextColor="rgba(255,255,255,0.4)"
          accessibilityLabel="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="go"
          editable={!loading}
          style={{
            height: 52, borderWidth: 1, borderColor: showFormatHint ? "#F87171" : "rgba(255,255,255,0.28)", borderRadius: 999, paddingHorizontal: 20,
            fontFamily: "Poppins_400Regular", fontSize: 14.5, color: "#FFFFFF", marginBottom: showFormatHint ? 6 : 14, opacity: loading ? 0.6 : 1,
          }}
        />

        {showFormatHint && (
          <Text accessibilityLiveRegion="polite" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, color: "#F87171", marginBottom: 12, marginLeft: 4, lineHeight: 18 }}>
            Check your email address. It should look like name@gmail.com.
          </Text>
        )}

        {error && (
          <View
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={{ borderWidth: 1, borderColor: "rgba(248,113,113,0.6)", backgroundColor: "rgba(248,113,113,0.12)", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 14 }}
          >
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13.5, lineHeight: 20, color: "#FFFFFF" }}>{error}</Text>
          </View>
        )}

        <Pressable
          onPress={onContinueWithEmail}
          disabled={!canContinue}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canContinue }}
          style={{
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52,
            backgroundColor: canContinue ? "#FBF7F2" : "rgba(255,255,255,0.15)", borderRadius: 999, marginBottom: 4,
          }}
        >
          {loading && <ActivityIndicator color="#333C81" size="small" />}
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: canContinue ? "#333C81" : "rgba(255,255,255,0.5)" }}>
            {loading ? "Sending code…" : "Continue"}
          </Text>
        </Pressable>

        {/* New people can start with the form straight away; someone who types an address with no account is sent there too. */}
        <Pressable onPress={onCreateAccount} accessibilityRole="button" style={{ minHeight: 48, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13.5, color: "rgba(255,255,255,0.7)" }}>
            New to Jourrrney? <Text style={{ fontFamily: "Poppins_700Bold", color: "#A9B1F5" }}>Create an account</Text>
          </Text>
        </Pressable>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
          <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11.5, color: "rgba(255,255,255,0.55)" }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
        </View>

        <View style={{ gap: 12, marginBottom: 8 }}>
          {SOCIAL_BUTTONS.map((btn) => {
            const busy = busyProvider === btn.provider;
            return (
              <Pressable
                key={btn.provider}
                onPress={() => onSocial(btn.provider)}
                disabled={!!busyProvider}
                accessibilityRole="button"
                accessibilityLabel={busy ? `Opening ${providerName(btn.provider)}` : btn.label}
                style={{
                  flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 52,
                  borderWidth: 1, borderColor: "rgba(255,255,255,0.28)", borderRadius: 999,
                  opacity: busyProvider && !busy ? 0.5 : 1,
                }}
              >
                {busy ? <ActivityIndicator color="#FFFFFF" size="small" /> : btn.icon}
                <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14.5, color: "#FFFFFF" }}>{busy ? `Opening ${providerName(btn.provider)}…` : btn.label}</Text>
              </Pressable>
            );
          })}
          {socialError && (
            <View
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
              style={{ borderWidth: 1, borderColor: "rgba(248,113,113,0.6)", backgroundColor: "rgba(248,113,113,0.12)", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }}
            >
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, lineHeight: 21, color: "#FFFFFF" }}>{socialError}</Text>
            </View>
          )}
        </View>

        {/* Sign-in is never forced: a real, full-size button, not a tiny word. */}
        <Pressable
          onPress={onSkip}
          accessibilityRole="button"
          style={{ minHeight: 52, alignItems: "center", justifyContent: "center", marginBottom: 8 }}
        >
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14.5, color: "#A9B1F5" }}>Continue as a guest</Text>
        </Pressable>

        {/* The two links open the public web pages (the same words as Profile > Settings), so a
            person can read them before they have an account. */}
        <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 19, color: "rgba(255,255,255,0.6)" }}>
          By continuing, you confirm you are 18 or older and agree to Jourrrney's{" "}
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

      <View style={{ alignItems: "center", paddingTop: 24 }}>
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 2 }}>
          JOURRRNEY
        </Text>
      </View>
    </ScrollView>
  );
}
