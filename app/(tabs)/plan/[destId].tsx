import { useCallback, useState } from "react";
import { BackHandler } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, router } from "expo-router";
import PlanTrip from "@/screens/PlanTrip/PlanTrip";

/**
 * "Plan My Trip" opened from a destination's own page. Lives inside the tabs
 * (as a hidden tab — see href: null in (tabs)/_layout.tsx) rather than as a
 * separate modal, so it gets exactly the same chrome as the Plan Trip tab: the
 * floating bottom bar and the profile pill. Only the greeting differs, since
 * the destination is already known.
 */
export default function PlanForDestinationRoute() {
  const { destId } = useLocalSearchParams<{ destId: string }>();
  const tabBarHeight = useBottomTabBarHeight();
  // Tab screens stay mounted when you leave them. The old modal always started
  // fresh each time it was opened, so remount the chat whenever this screen
  // loses focus (and when it's opened for a different destination).
  const [session, setSession] = useState(0);

  // Back must return to the destination page that opened this. router.back()
  // would only step through the tab history (to the Discover tab) first, so pop
  // the whole tabs screen off the root stack instead, falling back to the
  // destination page itself when this screen was opened directly.
  const goBack = useCallback(() => {
    if (router.canDismiss()) router.dismiss();
    else router.replace(`/destination/${destId}`);
  }, [destId]);

  useFocusEffect(
    useCallback(() => {
      // Android hardware back button should do the same as the on-screen arrow.
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        goBack();
        return true;
      });
      return () => {
        subscription.remove();
        setSession((s) => s + 1);
      };
    }, [goBack]),
  );
  return <PlanTrip key={`${destId}-${session}`} preselectedId={destId} onBack={goBack} tabBarHeight={tabBarHeight} />;
}
