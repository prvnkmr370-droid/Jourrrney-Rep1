/**
 * The four pages a destination's home page opens, one per row:
 *
 *   stay    Hotels                  the hotels our guide names + price ladder + "What a day costs"
 *   reach   How to get there        From my city, Getting around
 *   know    What to know before I go  What to pack, City tips, Safety notices, Trip Prep
 *   safety  Is it safe?             the women's-safety score, tips and numbers
 *
 * They replace the old tab strip (About, Day plan, Stay, How to reach, Budget,
 * Safety): About and the ready-made day now live on the home page itself, and
 * Budget is the last section of Hotels (the route key stays "stay").
 */
import { View, Text } from "react-native";
import type { Destination } from "@/data/destinations";
import { useThemeColors } from "@/theme/useThemeColors";
import SubPage from "../SubPage";
import StayGuide from "../StayGuide";
import HotelsList, { listedHotelLines } from "../HotelsList";
import BudgetTab from "../tabs/BudgetTab";
import HowToReachTab from "../tabs/HowToReachTab";
import SafetyTab from "../tabs/SafetyTab";

export const DESTINATION_PAGES = ["stay", "reach", "know", "safety"] as const;
export type DestinationPageId = (typeof DESTINATION_PAGES)[number];

export function isDestinationPage(value: string | undefined): value is DestinationPageId {
  return !!value && (DESTINATION_PAGES as readonly string[]).includes(value);
}

export default function DestinationPage({ destination: d, page }: { destination: Destination; page: DestinationPageId }) {
  const c = useThemeColors();
  const placeName = d.name.replace(/\s*\([^)]*\)/g, "").trim();

  switch (page) {
    case "stay":
      return (
        <SubPage destination={d} title="Hotels" subtitle={`Near ${placeName}. Prices are a guide for one room a night.`}>
          <HotelsList destination={d} />
          <StayGuide destination={d} listed={listedHotelLines(d)} />
          <Text accessibilityRole="header" maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 19, lineHeight: 26, color: c.textPrimary, paddingHorizontal: 20, marginTop: 28 }}>
            What a day costs
          </Text>
          <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary, paddingHorizontal: 20, marginTop: 2 }}>
            Per person, for the whole day.
          </Text>
          <BudgetTab destination={d} />
        </SubPage>
      );
    case "reach":
      return (
        <SubPage destination={d} title="How to get there" subtitle={`Getting to ${placeName} and getting around.`}>
          {({ scrollTopicIntoView }) => (
            <HowToReachTab destination={d} only={["arrive", "localTransport"]} showTripPrep={false} onTopicOpen={scrollTopicIntoView} />
          )}
        </SubPage>
      );
    case "know":
      return (
        <SubPage destination={d} title="What to know before I go" subtitle="Packing, local tips and safety notices.">
          {({ scrollTopicIntoView }) => (
            <HowToReachTab destination={d} only={["weather", "essentials", "advisory"]} onTopicOpen={scrollTopicIntoView} />
          )}
        </SubPage>
      );
    case "safety":
      return (
        <SubPage destination={d} title="Is it safe?" subtitle="Women's safety, tips and emergency numbers.">
          <View>
            <SafetyTab destination={d} />
          </View>
        </SubPage>
      );
  }
}
