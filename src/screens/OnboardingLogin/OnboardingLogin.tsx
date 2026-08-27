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
 * IMPORTANT: none of this performs real auth. Email would need a
 * magic-link/OTP backend (e.g. Firebase Auth) to actually send and verify
 * a code; Google, Apple, and Facebook sign-in each need credentials from
 * that provider's own developer console (a Google OAuth client ID, an
 * Apple Developer Program enrollment + Sign in with Apple capability, a
 * Facebook App ID) that we don't have yet. Every path here just marks the
 * user "signed in" in useProfileStore — swap in real provider/backend
 * calls at the same call sites once credentials exist.
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
  const signIn = useProfileStore((s) => s.signIn);
  const skip = useProfileStore((s) => s.skip);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");

  const handleSkip = () => {
    skip();
    onDone();
  };

  const handleSocial = (provider: Exclude<AuthProvider, null>) => {
    signIn(provider);
    onDone();
  };

  const handleContinueWithEmail = () => {
    if (!email.trim()) return;
    setStep("confirm");
  };

  const handleConfirmCode = () => {
    signIn("email");
    onDone();
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
          topInset={insets.top}
          bottomInset={insets.bottom}
        />
      ) : (
        <ConfirmCodeStep email={email} onBack={() => setStep("email")} onConfirm={handleConfirmCode} topInset={insets.top} />
      )}
    </View>
  );
}
