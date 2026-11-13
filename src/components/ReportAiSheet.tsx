/**
 * The "Report this reply" sheet: why it is being reported (four plain choices), an optional note, and a Send button.
 * It is shown for one AI-written thing at a time (`target`; null = closed). After sending it says thank you. Used by
 * the chat (ChatStep) and the plan screen (ResultStep). See utils/aiReport.ts.
 */
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Check, Flag } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";
import { MAX_REPORT_NOTE, REPORT_REASONS, sendAiReport, type ReportReason, type ReportTarget } from "@/utils/aiReport";

const MAX_FONT = 1.3;

export default function ReportAiSheet({ target, onClose }: { target: ReportTarget | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  // Every time the sheet opens for something, start from a clean form.
  useEffect(() => {
    if (target) { setReason(null); setNote(""); setStatus("idle"); setError(null); }
  }, [target]);

  const submit = async () => {
    if (!target || !reason || status === "sending") return;
    setStatus("sending");
    setError(null);
    const result = await sendAiReport({ kind: target.kind, reason, comment: note.trim() || undefined, content: target.content, context: target.context });
    if (result.ok) setStatus("sent");
    else { setStatus("idle"); setError(result.error ?? "We couldn't send your report. Please try again."); }
  };

  const sent = status === "sent";
  return (
    <Modal visible={!!target} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.55)" }}>
        <Pressable accessibilityLabel="Close" onPress={onClose} style={{ flex: 1 }} />
        <View
          accessibilityViewIsModal
          style={{
            backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: c.border,
            maxHeight: "88%", paddingTop: 22, paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 16) + 8,
          }}
        >
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: withOpacity(c.primary, 0.14), alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              {sent ? <Check color={c.primary} size={26} /> : <Flag color={c.primary} size={24} />}
            </View>

            {sent ? (
              <>
                <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 20, lineHeight: 27, color: c.textPrimary }}>Thank you</Text>
                <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 14.5, lineHeight: 22, color: c.textSecondary, marginTop: 6 }}>
                  We got your report and we'll look into it. It helps us make Tia's answers better and safer.
                </Text>
                <Pressable onPress={onClose} accessibilityRole="button" android_ripple={{ color: withOpacity(c.onPrimary, 0.2) }} style={{ marginTop: 18, minHeight: 52, borderRadius: 14, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}>
                  <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.onPrimary }}>Done</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 20, lineHeight: 27, color: c.textPrimary }}>
                  {target?.title ?? "Report"}
                </Text>
                <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 21, color: c.textSecondary, marginTop: 6, marginBottom: 14 }}>
                  What is wrong with it? We send the text you are reporting, and your note, to the Jourrrney team so we can look into it.
                </Text>

                <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
                  {REPORT_REASONS.map((r) => {
                    const picked = reason === r.id;
                    return (
                      <Pressable
                        key={r.id}
                        onPress={() => { setReason(r.id); setError(null); }}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: picked }}
                        accessibilityLabel={r.label}
                        android_ripple={{ color: withOpacity(c.primary, 0.12) }}
                        style={{
                          flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52, paddingHorizontal: 14, borderRadius: 14,
                          borderWidth: picked ? 2 : 1, borderColor: picked ? c.primary : c.border, backgroundColor: picked ? withOpacity(c.primary, 0.08) : "transparent",
                        }}
                      >
                        <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: picked ? c.primary : c.textSecondary, alignItems: "center", justifyContent: "center" }}>
                          {picked && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.primary }} />}
                        </View>
                        <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: picked ? "Poppins_600SemiBold" : "Poppins_400Regular", fontSize: 14, lineHeight: 20, color: c.textPrimary }}>{r.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add details (optional)"
                  placeholderTextColor={c.textSecondary}
                  accessibilityLabel="Add details, optional"
                  multiline
                  maxLength={MAX_REPORT_NOTE}
                  editable={status !== "sending"}
                  style={{
                    marginTop: 12, minHeight: 84, maxHeight: 140, borderWidth: 1, borderColor: c.border, borderRadius: 14, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12,
                    fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 20, color: c.textPrimary, textAlignVertical: "top",
                  }}
                />

                {error ? (
                  <Text accessibilityLiveRegion="polite" accessibilityRole="alert" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13.5, lineHeight: 20, color: c.warning, marginTop: 10 }}>
                    {error}
                  </Text>
                ) : null}

                <Pressable
                  onPress={submit}
                  disabled={!reason || status === "sending"}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !reason || status === "sending" }}
                  android_ripple={{ color: withOpacity(c.onPrimary, 0.2) }}
                  style={{ marginTop: 16, minHeight: 52, borderRadius: 14, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", backgroundColor: reason ? c.primary : withOpacity(c.primary, 0.3) }}
                >
                  {status === "sending" && <ActivityIndicator color={c.onPrimary} size="small" />}
                  <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.onPrimary }}>{status === "sending" ? "Sending…" : "Send report"}</Text>
                </Pressable>
                <Pressable onPress={onClose} accessibilityRole="button" android_ripple={{ color: withOpacity(c.primary, 0.12) }} style={{ marginTop: 8, minHeight: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" }}>
                  <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14.5, color: c.textSecondary }}>Cancel</Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
