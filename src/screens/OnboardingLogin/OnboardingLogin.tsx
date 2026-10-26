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
 * yet). Facebook and Google sign-in are real too: each opens the provider's login
 * in the phone's browser and comes back through app/auth.tsx (see journey-backend's
 * src/routes/facebookAuth.js and googleAuth.js); until that provider's keys are set
 * on the server the button says plainly that it isn't available yet. Apple sign-in
 * is not offered: it only ever marked the user "signed in" locally, and it needs an
 * Apple Developer Program enrollment we don't have. The button comes back in
 * EmailStep.tsx once it is real.
 */
import { useState } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfileStore, isSocialProvider, SOCIAL_NAME, type AuthProvider } from "@/store/useProfileStore";
import EmailStep from "./steps/EmailStep";
import ConfirmCodeStep from "./steps/ConfirmCodeStep";

interface Props {
  onDone: () => void;
}

type Step = "email" | "confirm";

export default function OnboardingLogin({ onDone }: Props) {
  const insets = useSafeAreaInsets();
  const { signIn, skip, requestCode, verifyCode, startSocialLogin } = useProfileStore();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [busyProvider, setBusyProvider] = useState<Exclude<AuthProvider, null> | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const handleSkip = () => {
    // "Skip" means "not now, as a guest". Someone whose saved session was just
    // restored is already signed in (their favourites and profile depend on
    // it), so skipping the login screen must not sign them out.
    if (!useProfileStore.getState().isSignedIn) skip();
    onDone();
  };

  const handleSocial = async (provider: Exclude<AuthProvider, null>) => {
    if (isSocialProvider(provider)) {
      // Real sign-in: the browser opens, and Facebook or Google sends the person back
      // to app/auth.tsx, which finishes the sign-in. This screen just waits.
      if (busyProvider || sending) return;
      setBusyProvider(provider);
      setSocialError(null);
      const result = await startSocialLogin(provider);
      setBusyProvider(null);
      if (!result.ok) setSocialError(result.error ?? `Couldn't open ${SOCIAL_NAME[provider]} — try again.`);
      return;
    }
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
        colors={["#090E1B", "#0E1424", "#141B2E"]}
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
          busyProvider={busyProvider}
          error={sendError}
          socialError={socialError}
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
