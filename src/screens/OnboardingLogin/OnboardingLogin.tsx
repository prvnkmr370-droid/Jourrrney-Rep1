/**
 * No Figma frame exists for this screen. Two-step flow, both ported from
 * reference screenshots the user supplied and adapted to our dark
 * gradient theme + compass brand mark rather than the references' literal
 * colors/logos: step 1 is "Sign in or create an account" (email field +
 * Google/Facebook/Apple); entering an email and tapping Continue moves to
 * step 2, "Let's confirm your email" (6-digit code entry). Sign-in stays
 * explicitly non-mandatory throughout — Skip (step 1) and every button on
 * both steps lead into the app the same way.
 *
 * The email path is now real: requestCode()/verifyCode() call
 * journey-backend (see its README for what's real vs. not — the code is
 * genuinely generated/verified server-side, but no email is actually sent
 * yet). Google, Apple, and Facebook sign-in still just mark the user
 * "signed in" locally — those need credentials from each provider's own
 * developer console (a Google OAuth client ID, an Apple Developer Program
 * enrollment, a Facebook App ID) that we don't have yet.
 */
import { useState } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfileStore, type AuthProvider } from "@/store/useProfileStore";
import EmailStep from "./steps/EmailStep";
import ConfirmCodeStep from "./steps/ConfirmCodeStep";

interface Props {
  onDone: () => void;
}

type Step = "email" | "confirm";

export default function OnboardingLogin({ onDone }: Props) {
  const insets = useSafeAreaInsets();
  const { signIn, skip, requestCode, verifyCode } = useProfileStore();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const handleSkip = () => {
    skip();
    onDone();
  };

  const handleSocial = (provider: Exclude<AuthProvider, null>) => {
    signIn(provider);
    onDone();
  };

  const handleContinueWithEmail = async () => {
    if (!email.trim() || sending) return;
    setSending(true);
    setSendError(null);
    const result = await requestCode(email.trim());
    setSending(false);
    if (!result.ok) {
      setSendError(result.error ?? "Couldn't send a code — try again.");
      return;
    }
    setDevCode(result.devCode ?? null);
    setVerifyError(null);
    setStep("confirm");
  };

  const handleConfirmCode = async (code: string) => {
    if (verifying) return;
    setVerifying(true);
    setVerifyError(null);
    const result = await verifyCode(email.trim(), code);
    setVerifying(false);
    if (!result.ok) {
      setVerifyError(result.error ?? "That code didn't work — try again.");
      return;
    }
    onDone();
  };

  const handleResend = async () => {
    const result = await requestCode(email.trim());
    if (result.ok) setDevCode(result.devCode ?? null);
    return result.ok;
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#0b1520", "#0D2B2E", "#1C1917"]}
        locations={[0, 0.4, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", inset: 0 }}
      />

      {step === "email" ? (
        <EmailStep
          email={email}
          onEmailChange={setEmail}
          onContinueWithEmail={handleContinueWithEmail}
          onSocial={handleSocial}
          onSkip={handleSkip}
          loading={sending}
          error={sendError}
          topInset={insets.top}
          bottomInset={insets.bottom}
        />
      ) : (
        <ConfirmCodeStep
          email={email}
          onBack={() => setStep("email")}
          onConfirm={handleConfirmCode}
          onResend={handleResend}
          loading={verifying}
          error={verifyError}
          devCode={devCode}
          topInset={insets.top}
        />
      )}
    </View>
  );
}
