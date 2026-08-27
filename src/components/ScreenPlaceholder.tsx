/**
 * Temporary stand-in used while each real screen is being built out.
 * Every route in app/ renders its src/screens/* component — swap the body
 * of that screen component for the real implementation and this
 * placeholder disappears on its own.
 */
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

interface Props {
  title: string;
  note?: string;
  showBack?: boolean;
}

export default function ScreenPlaceholder({ title, note, showBack }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {showBack && (
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center ml-3 mt-2">
          <ArrowLeft color="#1C1917" size={22} />
        </Pressable>
      )}
      <View className="flex-1 items-center justify-center px-8">
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 20, color: "#1C1917" }}>
          {title}
        </Text>
        <Text
          style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: "#78716C", marginTop: 8, textAlign: "center" }}
        >
          {note ?? "Not built yet — placeholder screen."}
        </Text>
      </View>
    </View>
  );
}
