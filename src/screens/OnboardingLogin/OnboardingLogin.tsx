/**
 * The sign-in screens. Sign-in is never forced: "Continue as a guest" and the close button lead into the
 * app the same way, and a guest can sign in later (for example when they tap a heart).
 *
 *   email   "Sign in or create an account": the email box first, then Google and Facebook below it.
 *   confirm "Check your email": the six emailed digits, confirmed as soon as the sixth is in.
 *   done    "You're signed in", then back to where the person was.
 *
 * The email path is real: requestCode()/verifyCode() call journey-backend (see its README). While no email
 * service is connected on the server it says so in plain words and points to Google and Facebook. Facebook and
 * Google sign-in are real too: each opens the provider's login in the phone's browser and comes back through
 * app/auth.tsx (see journey-backend's src/routes/facebookAuth.js and googleAuth.js). Apple sign-in is not
 * offered: it needs an Apple Developer Program enrollment we don't have. The button comes back in EmailStep.tsx
 * once it is real.
 */
import { useEffect, useState } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfileStore, isSocialProvider, SOCIAL_NAME, type AuthProvider } from "@/store/useProfileStore";
import EmailStep from "./steps/EmailStep";
import ConfirmCodeStep from "./steps/ConfirmCodeStep";
import SignedInStep from "./steps/SignedInStep";
import { isEmailLike } from "@/utils/isEmailLike";

interface Props {
  onDone: () => void;
}

type Step = "email" | "confirm" | "done";

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
  const [needsNewCode, setNeedsNewCode] = useState(false);

  // After "You're signed in" the screen moves on by itself.
  useEffect(() => {
    if (step !== "done") return;
    const t = setTimeout(onDone, 1600);
    return () => clearTimeout(t);
  }, [step, onDone]);

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
    if (!isEmailLike(email) || sending) return;
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
    setNeedsNewCode(false);
    setStep("confirm");
  };

  const handleConfirmCode = async (code: string) => {
    if (verifying) return;
    setVerifying(true);
    setVerifyError(null);
    const result = await verifyCode(email.trim(), code);
    setVerifying(false);
    if (!result.ok) {
      setVerifyError(result.error ?? "That code didn't work. Please try again.");
      setNeedsNewCode(!!result.needsNewCode);
      return;
    }
    setStep("done");
  };

  const handleResend = async () => {
    const result = await requestCode(email.trim());
    if (result.ok) { setDevCode(result.devCode ?? null); setVerifyError(null); setNeedsNewCode(false); }
    else setVerifyError(result.error ?? "We couldn't send a new code. Please try again.");
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

      {step === "done" ? (
        <SignedInStep email={email.trim()} onContinue={onDone} />
      ) : step === "email" ? (
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
          onBack={() => { setStep("email"); setVerifyError(null); setNeedsNewCode(false); }}
          onConfirm={handleConfirmCode}
          onResend={handleResend}
          loading={verifying}
          error={verifyError}
          needsNewCode={needsNewCode}
          onEdit={() => { if (!needsNewCode) setVerifyError(null); }}
          devCode={devCode}
          topInset={insets.top}
        />
      )}
    </View>
  );
}
