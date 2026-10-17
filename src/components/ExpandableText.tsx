/**
 * Long copy clamped to a few lines with an in-place "Read more" / "Show less"
 * toggle. Behaviour follows the common guidance for this pattern:
 *
 * - The toggle only exists when the text genuinely overflows the clamp (or when
 *   there is extra content to reveal, see `expandedExtra`), so a short
 *   description never shows a pointless link. That is decided by
 *   measuring an invisible, unclamped copy of the text against the clamped
 *   one (onLayout, which works on native and react-native-web alike —
 *   onTextLayout does not exist on web).
 * - It is a button that changes its own label ("Read more" <-> "Show less")
 *   and reports `expanded` to screen readers; focus stays on the toggle.
 * - The tap target is at least 44pt tall even though it looks like a small
 *   link, with a chevron to signal that more content is there. It sits at the
 *   right-hand edge, under the text block, with the chevron to the left of
 *   the label.
 */
import { useState, type ReactNode } from "react";
import { LayoutAnimation, Platform, Pressable, Text, UIManager, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  text: string;
  /** Lines shown while collapsed. */
  lines?: number;
  textStyle: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
  /** Makes the toggle's screen-reader label specific, e.g. "Read more about Rock Garden". */
  subject?: string;
  /**
   * Content that belongs to the same block and is shown only while expanded,
   * directly under the full text (for example a destination's Top highlights).
   * "Show less" folds it away together with the long text, and its presence
   * means the toggle always exists, even for a short description.
   */
  expandedExtra?: ReactNode;
}

export default function ExpandableText({ text, lines = 4, textStyle, style, subject, expandedExtra }: Props) {
  const c = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);
  const [fullHeight, setFullHeight] = useState<number | null>(null);

  // Only meaningful once both have been measured; the 2px slack absorbs
  // sub-pixel rounding between the two copies.
  const overflows = collapsedHeight != null && fullHeight != null && fullHeight > collapsedHeight + 2;
  const canToggle = overflows || !!expandedExtra;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  const label = expanded ? "Show less" : "Read more";
  const Chevron = expanded ? ChevronUp : ChevronDown;

  return (
    <View style={style}>
      <View>
        <Text
          style={textStyle}
          numberOfLines={expanded ? undefined : lines}
          // Keep the collapsed height from the clamped state only; once
          // expanded the visible text is the full height by definition.
          onLayout={(e) => { if (!expanded) setCollapsedHeight(e.nativeEvent.layout.height); }}
        >
          {text}
        </Text>
        {/* Invisible, unclamped twin used purely to measure the full height. */}
        <Text
          style={[textStyle, { position: "absolute", left: 0, right: 0, top: 0, opacity: 0 }]}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          onLayout={(e) => setFullHeight(e.nativeEvent.layout.height)}
        >
          {text}
        </Text>
      </View>

      {expanded && expandedExtra ? <View>{expandedExtra}</View> : null}

      {canToggle && (
        // An explicit full-width row that pushes its content to the right,
        // rather than relying on the button's own alignSelf.
        <View style={{ flexDirection: "row", justifyContent: "flex-end", alignSelf: "stretch", width: "100%" }}>
          <Pressable
            onPress={toggle}
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            accessibilityLabel={subject ? `${label} about ${subject}` : label}
            hitSlop={{ top: 6, bottom: 6, left: 24, right: 8 }}
            android_ripple={{ color: withOpacity(c.primary, 0.12) }}
            style={{ flexDirection: "row", alignItems: "center", gap: 4, minHeight: 44 }}
          >
            <Chevron color={c.primary} size={16} />
            <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, lineHeight: 18, color: c.primary }}>{label}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
