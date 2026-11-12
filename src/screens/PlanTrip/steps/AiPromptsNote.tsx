/**
 * A small line above the chat for people who are not signed in: AI needs sign-in, planning by place name still
 * works, and one tap opens sign-in. Nothing shows once signed in. (If the server gives guests a few free prompts,
 * it says how many are left instead.)
 */
import { Pressable, Text } from "react-native";
import { router } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";
import { useAiAccessStore } from "@/store/useAiAccessStore";
import { useProfileStore } from "@/store/useProfileStore";

const MAX_FONT = 1.3;

export default function AiPromptsNote() {
  const c = useThemeColors();
  const signedIn = useProfileStore((s) => !!s.token);
  const used = useAiAccessStore((s) => s.used);
  const limit = useAiAccessStore((s) => s.limit);
  if (signedIn) return null;

  const left = Math.max(0, limit - used);
  const signInRequired = limit === 0;
  const none = left === 0 && !signInRequired;
  const tone = none ? c.warning : c.primary;
  const text = signInRequired
    ? "Sign in to use Tia's AI answers. Typing a place name still works."
    : none
      ? "You've used your free AI prompts. Planning still works without AI. Sign in for more."
      : `${left} of ${limit} free AI prompts left. Sign in for more.`;

  return (
    <Pressable
      onPress={() => router.push("/profile/sign-in")}
      accessibilityRole="button"
      accessibilityLabel={text}
      style={{
        flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginBottom: 8, minHeight: 44,
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: withOpacity(tone, 0.1), borderWidth: 1, borderColor: withOpacity(tone, 0.25),
      }}
    >
      <Sparkles color={tone} size={16} />
      <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_600SemiBold", fontSize: 12.5, lineHeight: 18, color: c.textPrimary }}>{text}</Text>
    </Pressable>
  );
}
