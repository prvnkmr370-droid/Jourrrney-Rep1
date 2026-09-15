/**
 * Web fallback for LocationPickerModal.
 *
 * The native version renders a real react-native-maps pin-drop picker,
 * which imports react-native internals (codegenNativeCommands) that don't
 * exist on web. Metro/Expo's platform-extension resolution (`.web.tsx`
 * beats `.tsx` when bundling for web) picks this file instead, so the web
 * bundle never touches react-native-maps at all — every other screen that
 * can reach this component (e.g. Destination Detail's "How to reach") stays
 * buildable on web instead of crashing the whole app.
 *
 * Same Props contract as the native file: this renders a simple modal
 * explaining the map picker needs the mobile app, with the same
 * onClose/onConfirm surface (onConfirm is unused here since there's no pin
 * to confirm) so callers don't need any platform-branching of their own.
 */
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { X, MapPinOff } from "lucide-react-native";
import { useThemeColors } from "@/theme/useThemeColors";

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (label: string) => void;
}

export default function LocationPickerModal({ visible, onClose }: Props) {
  const c = useThemeColors();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Pressable
            onPress={onClose}
            hitSlop={10}
            style={[styles.closeBtn, { backgroundColor: c.surfaceAlt }]}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <X size={18} color={c.textSecondary} />
          </Pressable>

          <View style={[styles.iconWrap, { backgroundColor: c.surfaceAlt }]}>
            <MapPinOff size={26} color={c.textSecondary} />
          </View>

          <Text style={[styles.title, { color: c.textPrimary }]}>
            Map picker needs the mobile app
          </Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            Dropping a pin on a map uses a native map view that isn't available in the web
            preview. Open Journey on iOS or Android to pick a starting point this way, or type a
            city name directly into the search field instead.
          </Text>

          <Pressable
            onPress={onClose}
            style={[styles.dismissBtn, { backgroundColor: c.primary }]}
            accessibilityRole="button"
          >
            <Text style={styles.dismissLabel}>Got it</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 20, textAlign: "center", marginBottom: 20 },
  dismissBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  dismissLabel: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});
