/**
 * The shell shared by the pages a destination's home page opens (Where to
 * stay, How to get there, What to know before I go, Is it safe?): a round
 * Back button, a plain page title, the content, and the same "Plan my trip
 * with AI" bar as the home page. Each page is its own screen, so there is no
 * tab strip and nothing nested inside anything else.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Keyboard, Platform, type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { useThemeColors } from "@/theme/useThemeColors";
import PlanBar from "./PlanBar";

interface Helpers {
  /** For a card opened further down the page: scrolls its header back into view if it fell off the top. */
  scrollTopicIntoView: (headerY: number) => void;
}

interface Props {
  destination: Destination;
  title: string;
  subtitle?: string;
  children: ReactNode | ((helpers: Helpers) => ReactNode);
}

export default function SubPage({ destination: d, title, subtitle, children }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const placeName = d.name.replace(/\s*\([^)]*\)/g, "").trim();

  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const bodyY = useRef(0);
  const scrollTopicIntoView = (headerY: number) => {
    const target = bodyY.current + headerY - 12;
    if (scrollY.current > target) scrollRef.current?.scrollTo({ y: Math.max(0, target), animated: true });
  };

  // Back goes to the home page. If this page was opened directly (a reload, a
  // shared link) there is nothing to go back to, so it opens the home page instead.
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/destination/${d.id}`);
  };

  // Keyboard-clearance safety net for pages with a text box (How to get there
  // has a city search): padding the scroll content by the keyboard's real
  // height guarantees there is room to scroll a focused input clear.
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvt, (e) => setKeyboardHeight(e.endCoordinates?.height ?? 0));
    const hideSub = Keyboard.addListener(hideEvt, () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View
        style={{
          flexDirection: "row", alignItems: "center", gap: 10, paddingTop: insets.top + 8, paddingBottom: 8, paddingHorizontal: 12,
          borderBottomWidth: 1, borderBottomColor: c.borderSoft, backgroundColor: c.bg,
        }}
      >
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel={`Back to ${placeName}`}
          style={{
            width: 44, height: 44, borderRadius: 22, backgroundColor: c.surfaceAlt,
            borderWidth: 1, borderColor: c.borderSoft, alignItems: "center", justifyContent: "center",
          }}
        >
          <ArrowLeft color={c.textPrimary} size={22} />
        </Pressable>
        <Text numberOfLines={1} maxFontSizeMultiplier={1.3} style={{ flex: 1, textAlign: "right", fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textSecondary }}>
          {placeName}
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => { scrollY.current = e.nativeEvent.contentOffset.y; }}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 100 + (keyboardHeight > 0 ? keyboardHeight + 16 : 0) }}
          showsVerticalScrollIndicator={false}
        >
          <Text accessibilityRole="header" maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 26, lineHeight: 33, color: c.textPrimary, paddingHorizontal: 20, paddingTop: 16 }}>
            {title}
          </Text>
          {subtitle ? (
            <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 20, color: c.textSecondary, paddingHorizontal: 20, marginTop: 2 }}>
              {subtitle}
            </Text>
          ) : null}
          <View onLayout={(e) => { bodyY.current = e.nativeEvent.layout.y; }}>
            {typeof children === "function" ? children({ scrollTopicIntoView }) : children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PlanBar placeName={placeName} onPress={() => router.push(`/plan/${d.id}`)} />
    </View>
  );
}
