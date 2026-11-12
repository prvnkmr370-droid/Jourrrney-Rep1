/**
 * The pause shown once per launch when a guest reaches for AI. AI is for signed-in people, and everything that is
 * not AI keeps working without an account, so the sheet says exactly that and offers the sign-in screen (email,
 * Google or Facebook). (If the server gives guests a few free prompts, it says they are used up instead.) It is
 * mounted once at the root (app/_layout.tsx) and opened by useAiAccessStore.
 */
import { Modal, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";
import { useAiAccessStore } from "@/store/useAiAccessStore";

const MAX_FONT = 1.3;

export default function AiLimitSheet() {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const open = useAiAccessStore((s) => s.sheetOpen);
  const limit = useAiAccessStore((s) => s.limit);
  const close = useAiAccessStore((s) => s.closeSheet);
  const signInRequired = limit === 0;

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.55)" }}>
        <Pressable accessibilityLabel="Close" onPress={close} style={{ flex: 1 }} />
        <View
          accessibilityViewIsModal
          style={{
            backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: c.border,
            paddingHorizontal: 20, paddingTop: 22, paddingBottom: Math.max(insets.bottom, 16) + 8,
          }}
        >
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: withOpacity(c.primary, 0.14), alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Sparkles color={c.primary} size={26} />
          </View>
          <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 20, lineHeight: 27, color: c.textPrimary }}>
            {signInRequired ? "Sign in to use AI" : `You've used your ${limit} free AI prompts`}
          </Text>
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 14.5, lineHeight: 22, color: c.textSecondary, marginTop: 6 }}>
            {signInRequired
              ? "Tia's AI answers, photo ideas and AI trip plans are for signed-in people. It's free and takes a minute. Searching for places, and everything else in the app, works without an account."
              : "Sign in to keep using AI search and trip planning. It's free, and you can also save your trips and recent searches. Everything else in the app stays open without an account."}
          </Text>
          <Pressable
            onPress={() => { close(); router.push("/profile/sign-in"); }}
            accessibilityRole="button"
            android_ripple={{ color: withOpacity(c.onPrimary, 0.2) }}
            style={{ marginTop: 18, minHeight: 52, borderRadius: 14, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}
          >
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.onPrimary }}>Sign in or create an account</Text>
          </Pressable>
          <Pressable
            onPress={close}
            accessibilityRole="button"
            android_ripple={{ color: withOpacity(c.primary, 0.12) }}
            style={{ marginTop: 8, minHeight: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" }}
          >
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14.5, color: c.textSecondary }}>Not now, keep exploring</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
