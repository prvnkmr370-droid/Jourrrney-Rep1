/**
 * The pause shown when someone who is not signed in taps a heart: favourites
 * belong to an account, so it explains that in plain words and offers the
 * email sign-in. It also covers a phone that is "signed in" with Google, Apple
 * or Facebook, which today does not create an account.
 */
import { Modal, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Heart } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";

const MAX_FONT = 1.3;

export function signInToSaveText(localOnlySignIn: boolean): string {
  return localOnlySignIn
    ? "Your favourites are kept on your account. This phone is signed in with a social button, which does not create an account yet, so please sign in with your email to save places."
    : "Your favourites are kept on your account, so you need to be signed in to save a place. It takes a minute with your email.";
}

export default function SignInToSaveSheet({
  visible, localOnlySignIn, onClose, onContinue,
}: {
  visible: boolean;
  localOnlySignIn: boolean;
  /** "Not now" / tapping outside: the person decided not to sign in. */
  onClose: () => void;
  /** "Sign in with email": the sheet closes and the sign-in screen opens. */
  onContinue: () => void;
}) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.55)" }}>
        <Pressable accessibilityLabel="Close" onPress={onClose} style={{ flex: 1 }} />
        <View
          accessibilityViewIsModal
          style={{
            backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: c.border,
            paddingHorizontal: 20, paddingTop: 22, paddingBottom: Math.max(insets.bottom, 16) + 8,
          }}
        >
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: withOpacity(c.primary, 0.14), alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <Heart color={c.primary} size={26} />
          </View>
          <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 20, lineHeight: 27, color: c.textPrimary }}>
            Sign in to save favourites
          </Text>
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 14.5, lineHeight: 22, color: c.textSecondary, marginTop: 6 }}>
            {signInToSaveText(localOnlySignIn)}
          </Text>
          <Pressable
            onPress={() => { onContinue(); router.push("/profile/sign-in"); }}
            accessibilityRole="button"
            android_ripple={{ color: withOpacity(c.onPrimary, 0.2) }}
            style={{ marginTop: 18, minHeight: 52, borderRadius: 14, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}
          >
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.onPrimary }}>Sign in with email</Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            android_ripple={{ color: withOpacity(c.primary, 0.12) }}
            style={{ marginTop: 8, minHeight: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" }}
          >
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14.5, color: c.textSecondary }}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
