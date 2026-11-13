/**
 * The sign-in screens. Sign-in is never forced: "Continue as a guest" and the close button lead into the
 * app the same way, and a guest can sign in later (for example when they tap a heart).
 *
 *   email   "Sign in or create an account": the email box first, then Google and Facebook below it.
 *   create  "Create your account": first name, last name, email address and the "I am 18 or older" tick. Reached
 *           from "New to Jourrrney?", or automatically when the email typed on the first screen has no account.
 *           An account is never made by signing in: only by this form, and only once its emailed code is confirmed.
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
import CreateAccountStep, { type CreateField } from "./steps/CreateAccountStep";
import SignedInStep from "./steps/SignedInStep";
import { isEmailLike } from "@/utils/isEmailLike";

interface Props {
  onDone: () => void;
}

type Step = "email" | "create" | "confirm" | "done";

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

  // The create-account form, and whether the emailed code belongs to a sign-in or to a new account.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createField, setCreateField] = useState<CreateField>(null);
  const [createNotice, setCreateNotice] = useState<string | null>(null);
  const [codeMode, setCodeMode] = useState<"signin" | "signup">("signin");

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

  const goToCreate = (becauseNoAccount: boolean) => {
    setSendError(null);
    setCreateError(null);
    setCreateField(null);
    setCreateNotice(becauseNoAccount ? `There's no Jourrrney account for ${email.trim()} yet. Fill in your details below to create one.` : null);
    setStep("create");
  };

  const handleContinueWithEmail = async () => {
    if (!isEmailLike(email) || sending) return;
    setSending(true);
    setSendError(null);
    const result = await requestCode(email.trim(), { mode: "signin" });
    setSending(false);
    if (result.noAccount) {
      goToCreate(true);
      return;
    }
    if (!result.ok) {
      setSendError(result.error ?? "Couldn't send a code — try again.");
      return;
    }
    setCodeMode("signin");
    setDevCode(result.devCode ?? null);
    setVerifyError(null);
    setNeedsNewCode(false);
    setStep("confirm");
  };

  /** Typing in the form, or ticking the box, makes the last error stale: forget it. */
  const editCreateForm = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    if (createError) { setCreateError(null); setCreateField(null); }
  };

  const handleCreateAccount = async () => {
    const first = firstName.trim();
    const last = lastName.trim();
    if (creating || !first || !last || !isEmailLike(email) || !ageConfirmed) return;
    setCreating(true);
    setCreateError(null);
    setCreateField(null);
    const result = await requestCode(email.trim(), { mode: "signup", firstName: first, lastName: last, ageConfirmed: true });
    setCreating(false);
    if (!result.ok) {
      setCreateError(result.error ?? "We couldn't create your account just now. Please try again.");
      setCreateField((result.field as CreateField) ?? null);
      return;
    }
    setCodeMode("signup");
    setCreateNotice(null);
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
    // A new code for a new account carries the typed details again, so the account is still made when it is confirmed.
    const result = await requestCode(
      email.trim(),
      codeMode === "signup" ? { mode: "signup", firstName: firstName.trim(), lastName: lastName.trim(), ageConfirmed: true } : { mode: "signin" },
    );
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
          onCreateAccount={() => goToCreate(false)}
          loading={sending}
          busyProvider={busyProvider}
          error={sendError}
          socialError={socialError}
          topInset={insets.top}
          bottomInset={insets.bottom}
        />
      ) : step === "create" ? (
        <CreateAccountStep
          email={email}
          onEmailChange={editCreateForm(setEmail)}
          firstName={firstName}
          onFirstNameChange={editCreateForm(setFirstName)}
          lastName={lastName}
          onLastNameChange={editCreateForm(setLastName)}
          ageConfirmed={ageConfirmed}
          onAgeConfirmedChange={editCreateForm(setAgeConfirmed)}
          onSubmit={handleCreateAccount}
          onBack={() => { setStep("email"); setCreateError(null); setCreateField(null); }}
          loading={creating}
          error={createError}
          errorField={createField}
          notice={createNotice}
          topInset={insets.top}
          bottomInset={insets.bottom}
        />
      ) : (
        <ConfirmCodeStep
          email={email}
          onBack={() => { setStep(codeMode === "signup" ? "create" : "email"); setVerifyError(null); setNeedsNewCode(false); }}
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
