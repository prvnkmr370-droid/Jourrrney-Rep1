/** Source of truth: a reference screenshot the user supplied (dark
 * "Let's confirm your email" pattern) — ported to our theme. */
import { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { ArrowLeft } from "lucide-react-native";

const RESEND_COOLDOWN_S = 30;

interface Props {
  email: string;
  onBack: () => void;
  onConfirm: () => void;
  topInset: number;
}

export default function ConfirmCodeStep({ email, onBack, onConfirm, topInset }: Props) {
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const canContinue = code.length === 6;

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
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: "rgba(255,255,255,0.6)", marginBottom: 28 }}>
          Enter the secure code we sent to{" "}
          <Text style={{ fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.85)" }}>{email}</Text>. Check junk
          mail if it's not in your inbox.
        </Text>

        <TextInput
          value={code}
          onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
          placeholder="6-digit code"
          placeholderTextColor="rgba(255,255,255,0.4)"
          keyboardType="number-pad"
          style={{
            height: 52, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", borderRadius: 16, paddingHorizontal: 20,
            fontFamily: "Poppins_600SemiBold", fontSize: 16, letterSpacing: 4, color: "#FFFFFF", marginBottom: 16,
          }}
        />

        <Pressable
          onPress={onConfirm}
          disabled={!canContinue}
          style={{
            backgroundColor: canContinue ? "#FBF7F2" : "rgba(255,255,255,0.15)", borderRadius: 999, paddingVertical: 16, alignItems: "center", marginBottom: 20,
          }}
        >
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: canContinue ? "#333C81" : "rgba(255,255,255,0.5)" }}>
            Continue
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
            <Pressable onPress={() => setCooldown(RESEND_COOLDOWN_S)}>
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: "#8B93D6" }}>Resend code</Text>
            </Pressable>
          )}
        </View>

        <Pressable onPress={onConfirm} style={{ alignItems: "center" }}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: "#8B93D6" }}>Enter password instead</Text>
        </Pressable>
      </View>
    </View>
  );
}
