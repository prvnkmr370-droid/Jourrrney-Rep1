/**
 * "Delete my account" confirmation. Google Play requires that anyone who can
 * create an account in the app can also delete it, so this is reachable from
 * Profile > Settings (and from Settings & Privacy). It is a pop-up rather than
 * a system alert: the buttons are big, the words are plain, and the same screen
 * then confirms it worked. Deleting calls useProfileStore.deleteAccount, which
 * removes the account and its data from the server and signs this phone out.
 */
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { useThemeColors } from "@/theme/useThemeColors";
import { useProfileStore } from "@/store/useProfileStore";

interface Props {
  visible: boolean;
  /** Called when the pop-up is dismissed without deleting (Cancel / back button). */
  onClose: () => void;
  /** Called when the person taps Done after a successful delete, e.g. to go back Home. */
  onDeleted: () => void;
}

export default function DeleteAccountSheet({ visible, onClose, onDeleted }: Props) {
  const c = useThemeColors();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const close = () => {
    if (busy) return;
    setError(null);
    onClose();
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);
    const result = await useProfileStore.getState().deleteAccount();
    setBusy(false);
    if (result.ok) setDone(true);
    else setError(result.error ?? "Couldn't delete your account. Please try again.");
  };

  const finish = async () => {
    // Signing out last keeps this confirmation on screen until the person has read it.
    await useProfileStore.getState().signOut();
    setDone(false);
    onDeleted();
  };

  const body = { fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 22, color: c.textPrimary } as const;
  const buttonBase = { minHeight: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, paddingVertical: 10 } as const;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={done ? finish : close} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", padding: 20 }} accessibilityViewIsModal>
        <View style={{ backgroundColor: c.surface, borderRadius: 20, padding: 20, gap: 12, maxWidth: 480, width: "100%", alignSelf: "center" }}>
          {done ? (
            <>
              <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 18, lineHeight: 26, color: c.textPrimary }}>
                Your account has been deleted
              </Text>
              <Text maxFontSizeMultiplier={1.3} style={body}>
                Your email address, name, profile details and trip-planning history were removed from our server. Thank you for trying Jourrrney.
              </Text>
              <Pressable
                onPress={finish}
                accessibilityRole="button"
                android_ripple={{ color: "rgba(255,255,255,0.2)" }}
                style={{ ...buttonBase, backgroundColor: c.primary, marginTop: 4 }}
              >
                <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.onPrimary }}>Done</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 18, lineHeight: 26, color: c.textPrimary }}>
                Delete your account?
              </Text>
              <Text maxFontSizeMultiplier={1.3} style={body}>
                This permanently deletes your account, your profile details and your trip-planning history with Tia from our server. It can't be undone.
              </Text>
              <Text maxFontSizeMultiplier={1.3} style={{ ...body, color: c.textSecondary }}>
                Places you hearted and trips you saved are only on this phone, so they stay here until you remove the app.
              </Text>

              {error && (
                <Text accessibilityRole="alert" maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, lineHeight: 20, color: c.danger }}>
                  {error}
                </Text>
              )}

              <Pressable
                onPress={confirm}
                disabled={busy}
                accessibilityRole="button"
                accessibilityState={{ disabled: busy, busy }}
                android_ripple={{ color: "rgba(255,255,255,0.2)" }}
                style={{ ...buttonBase, backgroundColor: "#B91C1C", flexDirection: "row", gap: 8, opacity: busy ? 0.7 : 1, marginTop: 4 }}
              >
                {busy && <ActivityIndicator color="#FFFFFF" size="small" />}
                <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: "#FFFFFF", textAlign: "center" }}>
                  {busy ? "Deleting…" : "Yes, delete my account"}
                </Text>
              </Pressable>
              <Pressable
                onPress={close}
                disabled={busy}
                accessibilityRole="button"
                android_ripple={{ color: "rgba(0,0,0,0.08)" }}
                style={{ ...buttonBase, borderWidth: 1.5, borderColor: c.border }}
              >
                <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary }}>Keep my account</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
