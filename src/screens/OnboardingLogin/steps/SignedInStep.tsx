/** The short "you're in" screen after an email sign-in. It moves on by itself; Continue is for anyone who does not want to wait. */
import { View, Text, Pressable } from "react-native";
import { Check } from "lucide-react-native";

const MAX_FONT = 1.3;

export default function SignedInStep({ email, onContinue }: { email: string; onContinue: () => void }) {
  return (
    <View accessibilityLiveRegion="polite" style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, gap: 12 }}>
      <View style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: "rgba(217,182,106,0.18)", borderWidth: 2, borderColor: "#D9B66A", alignItems: "center", justifyContent: "center" }}>
        <Check color="#D9B66A" size={32} />
      </View>
      <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 24, lineHeight: 31, color: "#FFFFFF", textAlign: "center" }}>
        You're signed in
      </Text>
      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 21, color: "rgba(255,255,255,0.68)", textAlign: "center" }}>
        Signed in as {email}{"\n"}Taking you back to where you were…
      </Text>
      <Pressable
        onPress={onContinue}
        accessibilityRole="button"
        style={{ alignSelf: "stretch", minHeight: 52, marginTop: 14, borderRadius: 999, backgroundColor: "#FBF7F2", alignItems: "center", justifyContent: "center" }}
      >
        <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: "#333C81" }}>Continue</Text>
      </Pressable>
    </View>
  );
}
