/**
 * The Favourites tab: the places a registered, signed-in traveller has saved
 * with the heart, newest first. Signed-out people (and phones signed in only
 * through a social button, which creates no account) see why and a sign-in
 * button instead of a list. Removing a place can be undone for a few seconds.
 */
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Heart, Star } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DestImage from "@/components/DestImage";
import { withOpacity } from "@/components/withOpacity";
import { getTabBarFootprint } from "@/components/BottomTabBar";
import { signInToSaveText } from "@/components/SignInToSaveSheet";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import { useFavourites } from "@/hooks/useFavourites";
import { useThemeColors } from "@/theme/useThemeColors";

const MAX_FONT = 1.3;
const BY_ID = new Map(DESTINATIONS.map((d) => [d.id, d]));
// How long "Undo" stays: long enough for someone who reads slowly or needs a moment.
const UNDO_MS = 8000;
// The Undo bar is dark in both themes with light text, so "Undo" can be a light gold
// (about 11:1 contrast); the theme's own gold/indigo would be unreadable on it.
const UNDO_BAR_BG = "#1C1B22";
const UNDO_BAR_TEXT = "#F4EEE2";
const UNDO_ACTION = "#E8D5AC";

export default function FavouritesScreen() {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const fav = useFavourites();
  const footprint = getTabBarFootprint(insets.bottom);

  // The place just removed, so "Undo" can put it back where it was.
  const [undo, setUndo] = useState<{ id: string; name: string; index: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  // A different account (or none) must not inherit the previous one's undo.
  useEffect(() => { setUndo(null); }, [fav.account]);

  const places = fav.ids.map((id) => BY_ID.get(id)).filter((d): d is Destination => !!d);
  const count = places.length;

  const onRemove = (d: Destination) => {
    const index = fav.ids.indexOf(d.id);
    fav.remove(d.id);
    setUndo({ id: d.id, name: d.name.replace(/\s*\([^)]*\)/g, "").trim(), index });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setUndo(null), UNDO_MS);
  };
  const onUndo = () => {
    if (!undo) return;
    fav.restore(undo.id, undo.index);
    setUndo(null);
    if (timer.current) clearTimeout(timer.current);
  };

  const header = (
    <View style={{ paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: 14 }}>
      <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 26, lineHeight: 33, color: c.textPrimary }}>
        Favourites
      </Text>
      {fav.canSave && !fav.loading ? (
        <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 20, color: c.textSecondary, marginTop: 2 }}>
          {count === 0 ? "Places you save will be kept here." : `${count} ${count === 1 ? "place" : "places"} you saved`}
        </Text>
      ) : null}
    </View>
  );

  if (fav.loading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        {header}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: footprint }}>
          <ActivityIndicator color={c.primary} />
        </View>
      </View>
    );
  }

  if (!fav.canSave) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        {header}
        <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: footprint }}>
          <View style={{ backgroundColor: c.surface, borderRadius: 20, borderWidth: 1, borderColor: c.borderSoft, padding: 22, alignItems: "flex-start" }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: withOpacity(c.primary, 0.14), alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Heart color={c.primary} size={28} />
            </View>
            <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 19, lineHeight: 26, color: c.textPrimary }}>
              Keep the places you love
            </Text>
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 14.5, lineHeight: 22, color: c.textSecondary, marginTop: 6 }}>
              {signInToSaveText(fav.localOnlySignIn)}
            </Text>
            <Pressable
              onPress={() => router.push("/profile/sign-in")}
              accessibilityRole="button"
              android_ripple={{ color: withOpacity(c.onPrimary, 0.2) }}
              style={{ marginTop: 18, alignSelf: "stretch", minHeight: 52, borderRadius: 14, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}
            >
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.onPrimary }}>Sign in with email</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <FlatList
        data={places}
        keyExtractor={(d) => d.id}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingBottom: footprint + 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ marginHorizontal: 20, backgroundColor: c.surface, borderRadius: 20, borderWidth: 1, borderColor: c.borderSoft, padding: 22 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: withOpacity(c.primary, 0.14), alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Heart color={c.primary} size={28} />
            </View>
            <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 19, lineHeight: 26, color: c.textPrimary }}>
              No favourites yet
            </Text>
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 14.5, lineHeight: 22, color: c.textSecondary, marginTop: 6 }}>
              Open any place and tap the heart on its photo. It will be kept here for you.
            </Text>
            <Pressable
              onPress={() => router.navigate("/")}
              accessibilityRole="button"
              android_ripple={{ color: withOpacity(c.onPrimary, 0.2) }}
              style={{ marginTop: 18, minHeight: 52, borderRadius: 14, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}
            >
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.onPrimary }}>Explore places</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item: d }) => {
          const name = d.name.replace(/\s*\([^)]*\)/g, "").trim();
          return (
            <View style={{ marginHorizontal: 20, marginBottom: 12, flexDirection: "row", alignItems: "stretch", backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.borderSoft, overflow: "hidden" }}>
              <Pressable
                onPress={() => router.push(`/destination/${d.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`${name}, ${d.state}. Rated ${d.rating}. Opens the place.`}
                android_ripple={{ color: withOpacity(c.primary, 0.12) }}
                style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12, padding: 10 }}
              >
                <DestImage source={{ uri: d.image }} style={{ width: 84, height: 84, borderRadius: 14 }} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={2} maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 16, lineHeight: 22, color: c.textPrimary }}>{name}</Text>
                  <Text numberOfLines={1} maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary }}>{d.state.replace(/\s*\([^)]*\)/g, "").trim()}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <Star color="#FBBF24" fill="#FBBF24" size={13} />
                    <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>{d.rating}</Text>
                  </View>
                </View>
              </Pressable>
              <Pressable
                onPress={() => onRemove(d)}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${name} from favourites`}
                android_ripple={{ color: withOpacity(c.primary, 0.12) }}
                style={{ width: 56, alignItems: "center", justifyContent: "center" }}
              >
                <Heart color="#FF6B81" fill="#FF6B81" size={24} />
              </Pressable>
            </View>
          );
        }}
      />

      {undo && (
        <View
          accessibilityLiveRegion="polite"
          style={{ position: "absolute", left: 16, right: 16, bottom: footprint + 12, minHeight: 52, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: UNDO_BAR_BG, borderRadius: 14, paddingLeft: 14, paddingRight: 6 }}
        >
          <Text numberOfLines={2} maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_600SemiBold", fontSize: 13.5, lineHeight: 19, color: UNDO_BAR_TEXT }}>
            Removed {undo.name}
          </Text>
          <Pressable
            onPress={onUndo}
            accessibilityRole="button"
            accessibilityLabel={`Undo, put ${undo.name} back in favourites`}
            style={{ minHeight: 44, paddingHorizontal: 14, alignItems: "center", justifyContent: "center" }}
          >
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14.5, color: UNDO_ACTION }}>Undo</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
