/** Source of truth: a reference screenshot the user supplied (dark
 * "Let's confirm your email" pattern) — ported to our theme. Now backed
 * by a real server-side code check (journey-backend); see its README for
 * the honesty caveat that no email is actually sent yet. */
import { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator, Alert } from "react-native";
import { ArrowLeft } from "lucide-react-native";

const RESEND_COOLDOWN_S = 30;

interface Props {
  email: string;
  onBack: () => void;
  onConfirm: (code: string) => void;
  /** Re-requests a code from the backend; resolves to whether it worked. */
  onResend: () => Promise<boolean>;
  /** True while verifyCode() is in flight. */
  loading?: boolean;
  /** Set when verifyCode() fails — wrong code, expired, too many attempts,
   * or the backend being unreachable. */
  error?: string | null;
  /** Dev-only: the actual code, echoed back by the backend outside
   * production since no email is really sent yet. Shown as a labelled
   * hint so the flow is testable without an inbox — remove this prop's
   * usage once real email delivery is wired up server-side. */
  devCode?: string | null;
  topInset: number;
}

export default function ConfirmCodeStep({ email, onBack, onConfirm, onResend, loading, error, devCode, topInset }: Props) {
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const canContinue = code.length === 6 && !loading;

  const handleResend = async () => {
    setResending(true);
    const ok = await onResend();
    setResending(false);
    if (ok) setCooldown(RESEND_COOLDOWN_S);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 20, paddingTop: topInset + 12 }}>
        <Pressable onPress={onBack} hitSlop={8} style={{ width: 32 }}>
          <ArrowLeft color="#8B93D6" size={22} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 26, color: "#FFFFFF", marginBottom: 12 }}>
          Let's confirm your email
        </Text>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: "rgba(255,255,255,0.6)", marginBottom: devCode ? 8 : 28 }}>
          Enter the secure code we sent to{" "}
          <Text style={{ fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.85)" }}>{email}</Text>. Check junk
          mail if it's not in your inbox.
        </Text>

        {devCode && (
          <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, color: "#C9981F", marginBottom: 28 }}>
            Dev mode — no email is sent yet, your code is {devCode}
          </Text>
        )}

        <TextInput
          value={code}
          onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
          placeholder="6-digit code"
          placeholderTextColor="rgba(255,255,255,0.4)"
          keyboardType="number-pad"
          editable={!loading}
          style={{
            height: 52, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", borderRadius: 16, paddingHorizontal: 20,
            fontFamily: "Poppins_600SemiBold", fontSize: 16, letterSpacing: 4, color: "#FFFFFF", marginBottom: error ? 8 : 16,
          }}
        />

        {error && (
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: "#F87171", marginBottom: 16, lineHeight: 17 }}>
            {error}
          </Text>
        )}

        <Pressable
          onPress={() => onConfirm(code)}
          disabled={!canContinue}
          style={{
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
            backgroundColor: canContinue ? "#FBF7F2" : "rgba(255,255,255,0.15)", borderRadius: 999, paddingVertical: 16, marginBottom: 20,
          }}
        >
          {loading && <ActivityIndicator color="#333C81" size="small" />}
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: canContinue ? "#333C81" : "rgba(255,255,255,0.5)" }}>
            {loading ? "Confirming…" : "Continue"}
          </Text>
        </Pressable>

        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: "rgba(255,255,255,0.55)", textAlign: "center" }}>
            Didn't receive a code?
          </Text>
          {cooldown > 0 ? (
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: "rgba(255,255,255,0.55)", textAlign: "center" }}>
              You can request another code in {cooldown}s
            </Text>
          ) : (
            <Pressable onPress={handleResend} disabled={resending}>
              {resending ? (
                <ActivityIndicator color="#8B93D6" size="small" />
              ) : (
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: "#8B93D6" }}>Resend code</Text>
              )}
            </Pressable>
          )}
        </View>

        {/* Honest placeholder — there's no password auth on the backend,
            so this no longer silently confirms with an empty code. */}
        <Pressable
          onPress={() => Alert.alert("Password sign-in", "Not available yet — this app only supports email-code sign-in right now.")}
          style={{ alignItems: "center" }}
        >
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: "#8B93D6" }}>Enter password instead</Text>
        </Pressable>
      </View>
    </View>
  );
}
