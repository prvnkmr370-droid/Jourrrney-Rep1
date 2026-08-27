import "../global.css";
import { useEffect, useCallback } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from "@expo-google-fonts/poppins";
import { useResolvedScheme } from "@/theme/useThemeColors";
import { bootstrapProfileSession } from "@/store/useProfileStore";

// Keep the native splash screen up until fonts are ready — our own
// animated <SplashScreen /> route (app/index.tsx) takes over from there.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useResolvedScheme();
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  // Check once, on launch, whether a session token is already saved from
  // a previous sign-in — separate from the fonts/splash-screen gate above
  // so a slow/unreachable backend never blocks the app from opening.
  useEffect(() => {
    bootstrapProfileSession();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* "light" style = light icons, for a dark status bar area (used
            here when the app itself is in dark mode) — expo-status-bar's
            naming is the inverse of what it sounds like. */}
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="location-permission" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="search/index" options={{ presentation: "modal" }} />
          <Stack.Screen name="search/dates" options={{ presentation: "card" }} />
          <Stack.Screen name="search/results" options={{ presentation: "card" }} />
          <Stack.Screen name="profile/index" options={{ presentation: "modal" }} />
          <Stack.Screen name="profile/sign-in" options={{ presentation: "modal" }} />
          <Stack.Screen name="profile/safety-guard" options={{ presentation: "card" }} />
          <Stack.Screen name="profile/travel-preferences" options={{ presentation: "card" }} />
          <Stack.Screen name="profile/offline-maps" options={{ presentation: "card" }} />
          <Stack.Screen name="profile/settings" options={{ presentation: "card" }} />
          <Stack.Screen name="profile/legal/[doc]" options={{ presentation: "card" }} />
          <Stack.Screen name="destination/[id]" options={{ presentation: "card" }} />
          <Stack.Screen name="recently-viewed" options={{ presentation: "card" }} />
          <Stack.Screen name="plan/[destId]" options={{ presentation: "modal" }} />
          <Stack.Screen name="safety/[id]" options={{ presentation: "card" }} />
          <Stack.Screen name="safety/travel-safe-steps" options={{ presentation: "card" }} />
          <Stack.Screen name="safety/trip-prep" options={{ presentation: "card" }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
