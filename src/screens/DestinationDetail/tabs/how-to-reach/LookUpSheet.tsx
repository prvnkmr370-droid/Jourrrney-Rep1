/**
 * The short sheet shown before leaving the app to look up tickets: Jourrrney
 * doesn't sell tickets and prices change, so the person picks which site to
 * search on (or copies the route to paste into any airline or train app).
 */
import { useEffect, useState } from "react";
import { Alert, Linking, Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, Copy, ExternalLink } from "lucide-react-native";
import { useThemeColors } from "@/theme/useThemeColors";
import { lookUpOptions, routeText, type GatewayMode } from "./gatewayLinks";

export interface LookUpTarget {
  mode: GatewayMode;
  /** The code (VDY, HPT) or, for buses, the station or town name: what goes into a search box. */
  label: string;
  bookingUrl?: string;
  operatorName?: string;
}

interface Props {
  target: LookUpTarget | null;
  origin: string;
  onClose: () => void;
}

const WHAT: Record<GatewayMode, string> = { air: "flights", rail: "trains", bus: "buses" };

export default function LookUpSheet({ target, origin, onClose }: Props) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);
  useEffect(() => setCopied(false), [target]);

  if (!target) return null;
  const options = lookUpOptions(target.mode, origin, target);
  const route = routeText(origin, target.label);

  const open = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Couldn't open the site", "Please check that a browser is available, then try again.");
    }
  };

  const copy = async () => {
    try {
      // Loaded on demand so a phone without the clipboard module degrades to "can't copy" instead of crashing.
      const Clipboard = await import("expo-clipboard");
      await Clipboard.setStringAsync(route);
      setCopied(true);
    } catch {
      Alert.alert("Couldn't copy", `You can type it yourself: ${route}`);
    }
  };

  const row = { minHeight: 60, flexDirection: "row" as const, alignItems: "center" as const, gap: 12, backgroundColor: c.bg, borderWidth: 1, borderColor: c.border, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close" onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: c.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: Math.max(insets.bottom, 16) + 8 }}>
          <Text accessibilityRole="header" maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 18, lineHeight: 26, color: c.textPrimary }}>
            Look up {WHAT[target.mode]}, {route}
          </Text>
          <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 21, color: c.textSecondary, marginTop: 4, marginBottom: 14 }}>
            Jourrrney doesn't sell tickets, and prices change. Choose a site to search on:
          </Text>

          {options.map((o) => (
            <Pressable key={o.id} onPress={() => open(o.url)} accessibilityRole="link" accessibilityLabel={`${o.title}. ${o.subtitle}. Opens in your browser`} android_ripple={{ color: "rgba(0,0,0,0.08)" }} style={row}>
              <View style={{ flex: 1 }}>
                <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary }}>{o.title}</Text>
                <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary }}>{o.subtitle}</Text>
              </View>
              <ExternalLink color={c.textSecondary} size={20} />
            </Pressable>
          ))}

          <Pressable onPress={copy} accessibilityRole="button" accessibilityLabel={`Copy ${route}`} android_ripple={{ color: "rgba(0,0,0,0.08)" }} style={{ ...row, borderStyle: "dashed" }}>
            <View style={{ flex: 1 }}>
              <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary }}>{copied ? "Copied" : `Copy "${route}"`}</Text>
              <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary }}>To paste into any airline, train or bus app</Text>
            </View>
            {copied ? <Check color={c.success} size={20} /> : <Copy color={c.textSecondary} size={20} />}
          </Pressable>

          <Pressable onPress={onClose} accessibilityRole="button" style={{ minHeight: 48, alignItems: "center", justifyContent: "center", marginTop: 2 }}>
            <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 15, color: c.textSecondary }}>Not now</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
