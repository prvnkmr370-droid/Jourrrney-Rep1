/**
 * Where "Sign in with Facebook" and "Sign in with Google" land. The login runs in
 * the phone's browser; when it finishes, the journey-backend page opens
 *   journeyapp://auth?code=<one-time code>[&provider=google]      (or  ?error=<reason>)
 * and expo-router shows this screen. The code is swapped for a real login
 * (useProfileStore.completeSocialLogin) and the person is taken into the app.
 * The login token itself never travels in that link. A link with no `provider`
 * is Facebook's (that is how it always looked).
 */
import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfileStore, SOCIAL_NAME, type SocialProvider } from "@/store/useProfileStore";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";

const MAX_FONT = 1.3;

/** What each reason the server can send back means, in plain words. */
function messageFor(error: string | undefined, provider: SocialProvider): string {
  const name = SOCIAL_NAME[provider];
  switch (error) {
    case "cancelled":
      return `You chose not to continue with ${name}. You can try again, or sign in with your email.`;
    case "no_email":
      return provider === "google"
        ? "Google didn't share a verified email address with us, so we can't create your account. Please sign in with your email instead."
        : "Facebook didn't share an email address with us, so we can't create your account. Please sign in with your email instead.";
    case "state":
      return "That sign-in link has expired. Please try again.";
    case "not_configured":
      return `${name} sign-in isn't available yet. Please sign in with your email for now.`;
    default:
      return `${name} sign-in didn't work this time. Please try again.`;
  }
}

export default function AuthReturnRoute() {
  const { code, error, provider: providerParam } = useLocalSearchParams<{ code?: string; error?: string; provider?: string }>();
  const provider: SocialProvider = providerParam === "google" ? "google" : "facebook";
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const [problem, setProblem] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    if (typeof code === "string" && code) {
      started.current = true;
      useProfileStore.getState().completeSocialLogin(provider, code).then((result) => {
        if (result.ok) router.replace("/(tabs)");
        else setProblem(result.error ?? messageFor(undefined, provider));
      });
    } else if (error !== undefined || code !== undefined) {
      started.current = true;
      setProblem(messageFor(typeof error === "string" ? error : undefined, provider));
    }
  }, [code, error, provider]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {problem === null ? (
        <View accessibilityLiveRegion="polite" style={{ alignItems: "center", gap: 14 }}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 16, lineHeight: 23, color: c.textPrimary, textAlign: "center" }}>
            Signing you in…
          </Text>
        </View>
      ) : (
        <View accessibilityLiveRegion="polite" style={{ width: "100%", maxWidth: 420, gap: 12 }}>
          <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 22, lineHeight: 29, color: c.textPrimary }}>
            We couldn't sign you in
          </Text>
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 15, lineHeight: 23, color: c.textSecondary }}>{problem}</Text>
          <Pressable
            onPress={() => router.replace("/profile/sign-in")}
            accessibilityRole="button"
            android_ripple={{ color: withOpacity(c.onPrimary, 0.2) }}
            style={{ marginTop: 8, minHeight: 52, borderRadius: 14, backgroundColor: c.primary, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 }}
          >
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.onPrimary }}>Back to sign in</Text>
          </Pressable>
          <Pressable onPress={() => router.replace("/(tabs)")} accessibilityRole="button" style={{ minHeight: 48, alignItems: "center", justifyContent: "center" }}>
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, color: c.textSecondary }}>Not now</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
