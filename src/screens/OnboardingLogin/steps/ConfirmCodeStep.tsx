/**
 * Step 2 of the email sign-in: the six digits that were emailed. One hidden text box does the typing (so the
 * phone can offer the code above the keyboard and fill it in), and six boxes just show what was typed. The
 * code is checked as soon as the sixth digit is in; the Continue button is still there for anyone who needs it.
 */
import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator, ScrollView } from "react-native";
import { ArrowLeft } from "lucide-react-native";

const MAX_FONT = 1.3;
const RESEND_COOLDOWN_S = 30;
const CODE_LENGTH = 6;

interface Props {
  email: string;
  /** The back arrow and "Wrong email?": back to the email box. */
  onBack: () => void;
  onConfirm: (code: string) => void;
  /** Asks for another code. Resolves true when one was sent. */
  onResend: () => Promise<boolean>;
  /** True while the code is being checked. */
  loading?: boolean;
  /** Plain-words reason the last code failed. */
  error?: string | null;
  /** The code cannot be tried again (expired or too many wrong tries): offer a new one. */
  needsNewCode?: boolean;
  /** The person started typing again: the parent forgets the error. */
  onEdit?: () => void;
  /** Present only when the server is not sending real email (a development server). */
  devCode?: string | null;
  topInset: number;
}

export default function ConfirmCodeStep({ email, onBack, onConfirm, onResend, loading, error, needsNewCode, onEdit, devCode, topInset }: Props) {
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // A failed code stays on screen (red) for a moment so it can be read, then the boxes empty for the next try.
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => { setCode(""); inputRef.current?.focus(); }, 700);
    return () => clearTimeout(t);
  }, [error]);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digits);
    if (error) onEdit?.();
    if (digits.length === CODE_LENGTH && !loading) onConfirm(digits);
  };

  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    const ok = await onResend();
    setResending(false);
    if (ok) { setCooldown(RESEND_COOLDOWN_S); setCode(""); inputRef.current?.focus(); }
  };

  const canContinue = code.length === CODE_LENGTH && !loading;
  const failed = !!error;

  return (
    <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={{ paddingHorizontal: 20, paddingTop: topInset + 8 }}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to the email box"
          style={{ width: 48, height: 48, marginLeft: -10, alignItems: "center", justifyContent: "center" }}
        >
          <ArrowLeft color="#A9B1F5" size={24} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
        <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 26, lineHeight: 33, color: "#FFFFFF", marginBottom: 10 }}>
          Check your email
        </Text>
        <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 21, color: "rgba(255,255,255,0.68)", marginBottom: devCode ? 8 : 22 }}>
          We sent a 6-digit code to{" "}
          <Text style={{ fontFamily: "Poppins_600SemiBold", color: "#FFFFFF" }}>{email}</Text>.{" "}
          <Text accessibilityRole="link" onPress={onBack} style={{ fontFamily: "Poppins_700Bold", color: "#A9B1F5", textDecorationLine: "underline" }}>
            Wrong email?
          </Text>
        </Text>

        {devCode && (
          <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, color: "#C9981F", marginBottom: 20 }}>
            Dev mode: no email is sent, your code is {devCode}
          </Text>
        )}

        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: "row", gap: 8 }} pointerEvents="none">
            {Array.from({ length: CODE_LENGTH }).map((_, i) => {
              const digit = code[i] ?? "";
              const active = !failed && !loading && i === Math.min(code.length, CODE_LENGTH - 1);
              return (
                <View
                  key={i}
                  style={{
                    flex: 1, height: 56, borderRadius: 14, alignItems: "center", justifyContent: "center",
                    borderWidth: failed || active ? 1.5 : 1, borderColor: failed ? "#F87171" : active ? "#D9B66A" : "rgba(255,255,255,0.28)",
                  }}
                >
                  <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 22, color: failed ? "#F87171" : "#FFFFFF" }}>{digit}</Text>
                </View>
              );
            })}
          </View>
          {/* The real input lies over the boxes, invisible: tapping a box types into it, and the phone can fill the code in here. */}
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={handleChange}
            maxLength={CODE_LENGTH}
            autoFocus
            caretHidden
            editable={!loading}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            accessibilityLabel="6-digit code"
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, opacity: 0.02, color: "transparent" }}
          />
        </View>

        {error ? (
          <Text accessibilityLiveRegion="polite" accessibilityRole="alert" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: "#F87171", marginBottom: 14, lineHeight: 19 }}>
            {error}
          </Text>
        ) : (
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, color: "rgba(255,255,255,0.62)", marginBottom: 16, lineHeight: 18 }}>
            If your phone offers the code above the keyboard, tap it and we fill it in. We confirm as soon as the sixth digit is in.
          </Text>
        )}

        {needsNewCode ? (
          <Pressable
            onPress={handleResend}
            disabled={resending}
            accessibilityRole="button"
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52, backgroundColor: "#FBF7F2", borderRadius: 999, marginBottom: 18 }}
          >
            {resending && <ActivityIndicator color="#333C81" size="small" />}
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: "#333C81" }}>{resending ? "Sending…" : "Send a new code"}</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => onConfirm(code)}
            disabled={!canContinue}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canContinue }}
            style={{
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 52,
              backgroundColor: canContinue || loading ? "#FBF7F2" : "rgba(255,255,255,0.15)", borderRadius: 999, marginBottom: 18,
            }}
          >
            {loading && <ActivityIndicator color="#333C81" size="small" />}
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: canContinue || loading ? "#333C81" : "rgba(255,255,255,0.5)" }}>
              {loading ? "Confirming…" : "Continue"}
            </Text>
          </Pressable>
        )}

        <View style={{ alignItems: "center", gap: 2 }}>
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: "rgba(255,255,255,0.62)", textAlign: "center" }}>
            Didn't get it? Check your junk mail.
          </Text>
          {!needsNewCode && (cooldown > 0 ? (
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: "rgba(255,255,255,0.62)", textAlign: "center" }}>
              You can ask for another code in {cooldown}s
            </Text>
          ) : (
            <Pressable onPress={handleResend} disabled={resending} accessibilityRole="button" style={{ minHeight: 44, justifyContent: "center" }}>
              {resending ? <ActivityIndicator color="#A9B1F5" size="small" /> : <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: "#A9B1F5" }}>Send another code</Text>}
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
