import { View, Text, Pressable, TextInput } from "react-native";
import { X } from "lucide-react-native";
import { CompassMark } from "@/components/JourrrneyLogo";
import { GoogleIcon, FacebookIcon, AppleIcon } from "@/components/icons/BrandIcons";
import type { AuthProvider } from "@/store/useProfileStore";

const SOCIAL_BUTTONS: { provider: Exclude<AuthProvider, null>; label: string; icon: React.ReactNode }[] = [
  { provider: "google", label: "Sign in with Google", icon: <GoogleIcon size={18} /> },
  { provider: "facebook", label: "Sign in with Facebook", icon: <FacebookIcon size={20} /> },
  { provider: "apple", label: "Sign in with Apple", icon: <AppleIcon size={18} color="#FFFFFF" /> },
];

interface Props {
  email: string;
  onEmailChange: (v: string) => void;
  onContinueWithEmail: () => void;
  onSocial: (provider: Exclude<AuthProvider, null>) => void;
  onSkip: () => void;
  topInset: number;
  bottomInset: number;
}

export default function EmailStep({ email, onEmailChange, onContinueWithEmail, onSocial, onSkip, topInset, bottomInset }: Props) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: topInset + 12 }}>
        <Pressable onPress={onSkip} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <X color="#FFFFFF" size={22} />
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Skip</Text>
        </Pressable>
        <CompassMark size={32} />
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 28 }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 28, lineHeight: 34, color: "#FFFFFF", marginBottom: 12 }}>
          Sign in or create{"\n"}an account
        </Text>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: "rgba(255,255,255,0.6)", marginBottom: 28 }}>
          Unlock personalised trip planning, saved itineraries, and safety tools across Jourrrney.
        </Text>

        <TextInput
          value={email}
          onChangeText={onEmailChange}
          placeholder="Email"
          placeholderTextColor="rgba(255,255,255,0.4)"
          keyboardType="email-address"
          autoCapitalize="none"
          style={{
            height: 52, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", borderRadius: 999, paddingHorizontal: 20,
            fontFamily: "Poppins_400Regular", fontSize: 14, color: "#FFFFFF", marginBottom: 16,
          }}
        />

        <Pressable
          onPress={onContinueWithEmail}
          disabled={!email.trim()}
          style={{
            backgroundColor: email.trim() ? "#FBF7F2" : "rgba(255,255,255,0.15)", borderRadius: 999, paddingVertical: 16, alignItems: "center", marginBottom: 24,
          }}
        >
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: email.trim() ? "#333C81" : "rgba(255,255,255,0.5)" }}>
            Continue
          </Text>
        </Pressable>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
          <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
        </View>

        <View style={{ gap: 12, marginBottom: 24 }}>
          {SOCIAL_BUTTONS.map((btn) => (
            <Pressable
              key={btn.provider}
              onPress={() => onSocial(btn.provider)}
              style={{
                flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
                borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", borderRadius: 999, paddingVertical: 15,
              }}
            >
              {btn.icon}
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: "#FFFFFF" }}>{btn.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, lineHeight: 17, color: "rgba(255,255,255,0.45)" }}>
          By continuing, you agree to Jourrrney's{" "}
          <Text style={{ color: "#8B93D6" }}>Terms of Service</Text> and{" "}
          <Text style={{ color: "#8B93D6" }}>Privacy Policy</Text>.
        </Text>
      </View>

      <View style={{ alignItems: "center", paddingBottom: Math.max(bottomInset, 20) }}>
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 2 }}>
          JOURRRNEY
        </Text>
      </View>
    </View>
  );
}
