/**
 * "Create your account": first name, last name, email address and the "I am 18 or older" confirmation. This is the
 * only way an account is made with an email. The person reaches it from the email screen ("New to Jourrrney?"), or
 * automatically when they try to sign in with an address that has no account yet (then a notice says so). Nothing is
 * created here: "Create account" asks the server to email a 6-digit code, and the account is made when that code is
 * confirmed on the next screen.
 */
import { useRef, useState } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator, Linking, ScrollView } from "react-native";
import { ArrowLeft, Check } from "lucide-react-native";
import { API_BASE_URL } from "@/config/api";
import { isEmailLike } from "@/utils/isEmailLike";

const MAX_FONT = 1.3;

export type CreateField = "firstName" | "lastName" | "ageConfirmed" | null;

interface Props {
  email: string;
  onEmailChange: (v: string) => void;
  firstName: string;
  onFirstNameChange: (v: string) => void;
  lastName: string;
  onLastNameChange: (v: string) => void;
  ageConfirmed: boolean;
  onAgeConfirmedChange: (v: boolean) => void;
  /** "Create account": asks for the emailed code. */
  onSubmit: () => void;
  /** The back arrow and "Already have an account? Sign in": back to the email screen. */
  onBack: () => void;
  /** True while the code is being requested. */
  loading?: boolean;
  /** Plain-words reason the last try failed (shown above the button). */
  error?: string | null;
  /** Which field that error is about, so it can be outlined in red. */
  errorField?: CreateField;
  /** Shown when the person tried to sign in and there was no account: a calm "here is why you are on this page". */
  notice?: string | null;
  topInset: number;
  bottomInset: number;
}

const LINK = { color: "#A9B1F5", textDecorationLine: "underline" as const };

export default function CreateAccountStep({
  email, onEmailChange, firstName, onFirstNameChange, lastName, onLastNameChange, ageConfirmed, onAgeConfirmedChange,
  onSubmit, onBack, loading, error, errorField, notice, topInset, bottomInset,
}: Props) {
  const lastRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const [emailTouched, setEmailTouched] = useState(false);

  const emailOk = isEmailLike(email);
  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0 && emailOk && ageConfirmed && !loading;
  const showEmailHint = emailTouched && email.trim().length > 0 && !emailOk;

  const inputStyle = (bad: boolean) => ({
    height: 52, borderWidth: bad ? 1.5 : 1, borderColor: bad ? "#F87171" : "rgba(255,255,255,0.28)", borderRadius: 999, paddingHorizontal: 20,
    fontFamily: "Poppins_400Regular", fontSize: 14.5, color: "#FFFFFF", opacity: loading ? 0.6 : 1,
  });
  const label = (text: string) => (
    <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12.5, color: "rgba(255,255,255,0.78)", marginBottom: 6, marginLeft: 4 }}>
      {text}
    </Text>
  );

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: Math.max(bottomInset, 20) + 12 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: topInset + 8 }}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to the email screen" style={{ width: 48, height: 48, marginLeft: -10, alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft color="#A9B1F5" size={24} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
        <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 26, lineHeight: 33, color: "#FFFFFF", marginBottom: 8 }}>
          Create your account
        </Text>
        <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 20, color: "rgba(255,255,255,0.68)", marginBottom: notice ? 14 : 22 }}>
          It takes a minute. We email you a 6-digit code to finish.
        </Text>

        {notice ? (
          <View
            accessibilityLiveRegion="polite"
            style={{ borderWidth: 1, borderColor: "rgba(169,177,245,0.55)", backgroundColor: "rgba(169,177,245,0.12)", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20 }}
          >
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13.5, lineHeight: 20, color: "#FFFFFF" }}>{notice}</Text>
          </View>
        ) : null}

        {label("First name")}
        <TextInput
          value={firstName}
          onChangeText={onFirstNameChange}
          placeholder="First name"
          placeholderTextColor="rgba(255,255,255,0.4)"
          accessibilityLabel="First name"
          autoCapitalize="words"
          autoCorrect={false}
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="next"
          onSubmitEditing={() => lastRef.current?.focus()}
          editable={!loading}
          style={{ ...inputStyle(errorField === "firstName"), marginBottom: 14 }}
        />

        {label("Last name")}
        <TextInput
          ref={lastRef}
          value={lastName}
          onChangeText={onLastNameChange}
          placeholder="Last name"
          placeholderTextColor="rgba(255,255,255,0.4)"
          accessibilityLabel="Last name"
          autoCapitalize="words"
          autoCorrect={false}
          autoComplete="family-name"
          textContentType="familyName"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          editable={!loading}
          style={{ ...inputStyle(errorField === "lastName"), marginBottom: 14 }}
        />

        {label("Email address")}
        <TextInput
          ref={emailRef}
          value={email}
          onChangeText={onEmailChange}
          onBlur={() => setEmailTouched(true)}
          placeholder="name@example.com"
          placeholderTextColor="rgba(255,255,255,0.4)"
          accessibilityLabel="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="done"
          onSubmitEditing={() => { if (canSubmit) onSubmit(); }}
          editable={!loading}
          style={{ ...inputStyle(showEmailHint), marginBottom: showEmailHint ? 6 : 16 }}
        />
        {showEmailHint && (
          <Text accessibilityLiveRegion="polite" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, color: "#F87171", marginBottom: 14, marginLeft: 4, lineHeight: 18 }}>
            Check your email address. It should look like name@gmail.com.
          </Text>
        )}

        {/* The 18+ confirmation: a real checkbox that must be ticked, with the whole row as the tap target. */}
        <Pressable
          onPress={() => onAgeConfirmedChange(!ageConfirmed)}
          disabled={loading}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: ageConfirmed }}
          accessibilityLabel="I confirm that I am 18 years of age or older"
          style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52, marginBottom: 6 }}
        >
          <View
            style={{
              width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 2,
              borderColor: errorField === "ageConfirmed" ? "#F87171" : ageConfirmed ? "#D9B66A" : "rgba(255,255,255,0.55)",
              backgroundColor: ageConfirmed ? "#D9B66A" : "transparent",
            }}
          >
            {ageConfirmed && <Check color="#141B2E" size={18} strokeWidth={3} />}
          </View>
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_600SemiBold", fontSize: 14, lineHeight: 20, color: "#FFFFFF" }}>
            I confirm that I am 18 years of age or older.
          </Text>
        </Pressable>

        <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 19, color: "rgba(255,255,255,0.6)", marginBottom: 18 }}>
          By creating an account, you agree to Jourrrney's{" "}
          <Text accessibilityRole="link" onPress={() => Linking.openURL(`${API_BASE_URL}/terms`)} style={LINK}>Terms of Service</Text>
          {" "}and{" "}
          <Text accessibilityRole="link" onPress={() => Linking.openURL(`${API_BASE_URL}/privacy`)} style={LINK}>Privacy Policy</Text>.
        </Text>

        {error ? (
          <View
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={{ borderWidth: 1, borderColor: "rgba(248,113,113,0.6)", backgroundColor: "rgba(248,113,113,0.12)", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 14 }}
          >
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13.5, lineHeight: 20, color: "#FFFFFF" }}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={onSubmit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit }}
          style={{
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52,
            backgroundColor: canSubmit || loading ? "#FBF7F2" : "rgba(255,255,255,0.15)", borderRadius: 999, marginBottom: 12,
          }}
        >
          {loading && <ActivityIndicator color="#333C81" size="small" />}
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: canSubmit || loading ? "#333C81" : "rgba(255,255,255,0.5)" }}>
            {loading ? "Sending code…" : "Create account"}
          </Text>
        </Pressable>

        <Pressable onPress={onBack} accessibilityRole="button" style={{ minHeight: 48, alignItems: "center", justifyContent: "center" }}>
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13.5, color: "rgba(255,255,255,0.7)" }}>
            Already have an account? <Text style={{ fontFamily: "Poppins_700Bold", color: "#A9B1F5" }}>Sign in</Text>
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
