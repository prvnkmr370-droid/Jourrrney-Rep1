/**
 * Full photo gallery for one destination — reached via the "View all N"
 * button on DestinationDetail's hero carousel. No Figma frame; this is a
 * new screen for the scrollable-hero-photos feature (see the `gallery`
 * field's doc comment in destinations.ts for why it exists).
 *
 * Two states in one screen rather than two routes: a scrollable grid of
 * thumbnails, and — once one is tapped — a full-screen swipeable pager
 * over the same photos. Going back from the pager returns to the grid;
 * going back from the grid returns to wherever the user came from
 * (DestinationDetail, via router.back() — see app/destination/[id]/
 * gallery.tsx). Keeping the pager as an in-screen overlay rather than a
 * third route means there's only ever one "back" to reason about at
 * each level, matching what the user asked for: tap into full photos,
 * then come back to "the destination card... currently on."
 */
import { useState } from "react";
import { View, Text, Pressable, ScrollView, useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, X } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { useThemeColors } from "@/theme/useThemeColors";

const GRID_GAP = 3;
const GRID_COLS = 2;

interface Props {
  destination: Destination;
}

export default function PhotoGallery({ destination: d }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const { width } = useWindowDimensions();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const photos = d.gallery && d.gallery.length > 0 ? d.gallery : [d.heroImage];
  const tileSize = (width - GRID_GAP * (GRID_COLS + 1)) / GRID_COLS;

  if (viewerIndex !== null) {
    return (
      <FullScreenViewer
        photos={photos}
        startIndex={viewerIndex}
        onClose={() => setViewerIndex(null)}
        destinationName={d.name}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: insets.top + 8, paddingBottom: 12 }}>
        <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft color={c.textPrimary} size={18} />
        </Pressable>
        <View>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 17, color: c.textPrimary }}>{d.name} Photos</Text>
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary }}>
            {photos.length} photo{photos.length === 1 ? "" : "s"}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: GRID_GAP, gap: GRID_GAP }}>
          {photos.map((uri, i) => (
            <Pressable key={`${uri}-${i}`} onPress={() => setViewerIndex(i)} style={{ width: tileSize, height: tileSize }}>
              <Image source={{ uri }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function FullScreenViewer({
  photos,
  startIndex,
  onClose,
  destinationName,
}: {
  photos: string[];
  startIndex: number;
  onClose: () => void;
  destinationName: string;
}) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(startIndex);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        // Jump straight to the tapped thumbnail rather than always
        // opening on the first photo — contentOffset (not an initial
        // scrollTo, which would visibly animate) positions it before the
        // first paint.
        contentOffset={{ x: startIndex * width, y: 0 }}
      >
        {photos.map((uri, i) => (
          <Image key={`${uri}-${i}`} source={{ uri }} style={{ width, height }} contentFit="contain" />
        ))}
      </ScrollView>

      <Pressable
        onPress={onClose}
        style={{
          position: "absolute", top: insets.top + 8, left: 16,
          width: 40, height: 40, borderRadius: 20,
          backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center",
        }}
      >
        <X color="#FFFFFF" size={20} />
      </Pressable>

      <View
        style={{
          position: "absolute", top: insets.top + 8, right: 16,
          backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 999,
          paddingHorizontal: 12, paddingVertical: 8,
        }}
      >
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: "#FFFFFF" }}>
          {index + 1} / {photos.length}
        </Text>
      </View>

      <Text
        style={{
          position: "absolute", bottom: insets.bottom + 16, left: 0, right: 0, textAlign: "center",
          fontFamily: "Poppins_400Regular", fontSize: 12, color: "rgba(255,255,255,0.6)",
        }}
      >
        {destinationName}
      </Text>
    </View>
  );
}
