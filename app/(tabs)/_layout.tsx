import { View, Pressable, Text } from "react-native";
import { Tabs, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Menu } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomTabBar from "@/components/BottomTabBar";
import { useThemeColors } from "@/theme/useThemeColors";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <BottomTabBar {...props} />}
        // Same fix as the root Stack's contentStyle (see app/_layout.tsx) —
        // without it, each tab screen's own native container defaults to
        // white, which shows as a patch behind BottomTabBar's floating
        // pill wherever its transparent inset-padding leaves the true
        // window edge exposed.
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } }}
      >
        <Tabs.Screen name="index" options={{ title: "Discover" }} />
        <Tabs.Screen name="plan" options={{ title: "Plan Trip" }} />
        <Tabs.Screen name="safety" options={{ title: "Safety" }} />
      </Tabs>

      {/* Persistent profile pill — same "PS" avatar + hamburger look as the
          original Home-only version, now rendered above every tab (via a
          solid white pill + shadow, since a translucent-white pill only
          reads correctly over Home's dark photo, not Plan/Safety's light
          background) so it stays visible when switching tabs. */}
      <Pressable
        onPress={() => router.push("/profile")}
        style={{
          position: "absolute", top: insets.top + 8, right: 20,
          flexDirection: "row", alignItems: "center", gap: 6,
          height: 36, borderRadius: 18, paddingLeft: 4, paddingRight: 10,
          backgroundColor: c.surface,
          shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
          elevation: 4,
        }}
      >
        <LinearGradient
          colors={["#333C81", "#0D5C63"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ fontFamily: "Poppins_800ExtraBold", fontSize: 10, color: "#FFFFFF" }}>PS</Text>
        </LinearGradient>
        <Menu color={c.textPrimary} size={14} />
      </Pressable>
    </View>
  );
}
