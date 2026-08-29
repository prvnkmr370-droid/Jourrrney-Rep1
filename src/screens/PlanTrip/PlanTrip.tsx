/**
 * Step router for the Plan Trip wizard: chat → generating → result.
 * The chat step replaces what used to be a multi-section form (FormStep,
 * removed — see this change's commit) with a conversational blank-screen
 * AI input, per the user-supplied screenshot of the target design. The
 * generating step is Figma source of truth ("2.1.1 AI Generating —
 * Skeleton Loading"); result is Figma's "2.2 Generated Itinerary —
 * Timeline". Behavior (the itinerary-generation algorithm) is ported from
 * the Make prototype.
 */
import { useState } from "react";
import type { Destination } from "@/data/destinations";
import { DESTINATIONS } from "@/data/destinations";
import { useOriginStore } from "@/store/useOriginStore";
import { STYLE_CONFIGS, generateItinerary, generateMultiLegItinerary, type GeneratedDay, type TravelStyle, type TripPlan } from "./data";
import { tryGenerateAiItinerary } from "./aiPlan";
import ChatStep from "./steps/ChatStep";
import GeneratingStep from "./steps/GeneratingStep";
import ResultStep from "./steps/ResultStep";

interface Props {
  preselectedId?: string;
  onBack?: () => void;
  /** Height of the floating bottom tab bar, when shown as a tab (0 for the
   * modal/stack presentation, which has no tab bar). See ChatStep's doc
   * comment for why this has to be threaded through manually. */
  tabBarHeight?: number;
}

type Step = "chat" | "generating" | "result";

// Floor for how long the "Building your plan…" animation stays up — a
// real Gemini call sometimes resolves in under a second, which would make
// the loading screen feel like a glitch rather than genuine generation.
// The AI attempt and this delay run concurrently (Promise.all below), so
// this only ever adds wait time when the network is fast, never stacks on
// top of a slow one.
const MIN_GENERATE_DELAY_MS = 1400;

export default function PlanTrip({ preselectedId, onBack, tabBarHeight = 0 }: Props) {
  const [step, setStep] = useState<Step>("chat");
  const [travelStyle, setTravelStyle] = useState<TravelStyle>("comfortable");
  const [plan, setPlan] = useState<TripPlan | null>(null);
  // Origin lives in the same shared store the "How to Reach" route planner
  // already uses — one origin city for the whole app rather than a
  // separate copy just for this screen.
  const originCity = useOriginStore((s) => s.originCity);
  const preselectedDestination = preselectedId ? (DESTINATIONS.find((d) => d.id === preselectedId) ?? null) : null;

  const handleReady = async (legs: { destination: Destination; days: number }[], people: number, style: TravelStyle, interests: string[]) => {
    setTravelStyle(style);
    setStep("generating");

    // Interests fall back to the same defaults the old form pre-checked
    // when the chat's own opportunistic keyword-scan (see
    // parseTripMessage.ts) didn't catch anything from what was typed.
    const prefs = interests.length > 0 ? interests : ["heritage", "food"];
    // Chat doesn't collect a specific start date (kept out of the
    // conversation to stay short, matching the target design) — always
    // "flexible dates", same as never picking one on the old form.
    const startDate: string | null = null;
    const sc = STYLE_CONFIGS.find((s) => s.id === style)!;

    if (legs.length === 1) {
      // Single destination — unchanged from before this trip supported
      // multiple legs at all.
      const { destination, days } = legs[0];
      const budget = destination.budgetBreakdown.find((b) => b.tier === sc.budgetTier) ?? destination.budgetBreakdown[1];
      const templatePlan = generateItinerary(destination, days, people, style, prefs, originCity, startDate);

      const [aiResult] = await Promise.all([
        tryGenerateAiItinerary(destination, sc, days, people, prefs, originCity, startDate, budget.perDayPerPerson),
        new Promise((resolve) => setTimeout(resolve, MIN_GENERATE_DELAY_MS)),
      ]);

      const finalPlan: TripPlan = aiResult
        ? {
            ...templatePlan,
            planSource: "ai",
            itinerary: aiResult.itinerary.map((day, i) => ({
              ...day,
              // stay/stayType/transport aren't AI-generated (ResultStep
              // doesn't render them per-day anyway — see its Day-by-Day
              // section) — carried over from the matching template day so
              // the type stays fully populated regardless.
              stay: templatePlan.itinerary[i]?.stay ?? templatePlan.itinerary[0].stay,
              stayType: templatePlan.itinerary[i]?.stayType ?? templatePlan.itinerary[0].stayType,
              transport: templatePlan.itinerary[i]?.transport ?? templatePlan.itinerary[0].transport,
            })),
            tips: aiResult.tips.length > 0 ? aiResult.tips : templatePlan.tips,
          }
        : templatePlan;

      setPlan(finalPlan);
      setStep("result");
      return;
    }

    // Multi-destination ("Mysore then Coorg") — the template plan merges
    // one generateItinerary() call per leg (see generateMultiLegItinerary
    // in data.ts). The AI attempt mirrors that: one tryGenerateAiItinerary
    // call per leg, in parallel, each producing just that leg's days.
    // All-or-nothing on the AI side deliberately — mixing an AI-written
    // leg with a template-written leg in the same trip would read as an
    // inconsistent quality jump between stops, so any single leg's AI
    // call failing falls the *whole* plan back to the template version
    // rather than a partial blend.
    const templatePlan = generateMultiLegItinerary(legs, people, style, prefs, originCity, startDate);

    const [aiResults] = await Promise.all([
      Promise.all(
        legs.map((leg) => {
          const budget = leg.destination.budgetBreakdown.find((b) => b.tier === sc.budgetTier) ?? leg.destination.budgetBreakdown[1];
          return tryGenerateAiItinerary(leg.destination, sc, leg.days, people, prefs, originCity, startDate, budget.perDayPerPerson);
        }),
      ),
      new Promise((resolve) => setTimeout(resolve, MIN_GENERATE_DELAY_MS)),
    ]);

    const allAiSucceeded = aiResults.every((r) => r !== null);
    let finalPlan: TripPlan;
    if (allAiSucceeded) {
      let dayOffset = 0;
      const mergedItinerary: GeneratedDay[] = [];
      const combinedTips: string[] = [];
      legs.forEach((leg, i) => {
        const result = aiResults[i]!;
        const legTemplateDays = templatePlan.itinerary.slice(dayOffset, dayOffset + leg.days);
        result.itinerary.forEach((day, di) => {
          mergedItinerary.push({
            ...day,
            day: dayOffset + di + 1,
            legDestinationName: leg.destination.name,
            stay: legTemplateDays[di]?.stay ?? legTemplateDays[0]?.stay ?? "",
            stayType: legTemplateDays[di]?.stayType ?? legTemplateDays[0]?.stayType ?? "",
            transport: legTemplateDays[di]?.transport ?? legTemplateDays[0]?.transport ?? "",
          });
        });
        dayOffset += leg.days;
        if (result.tips.length > 0) combinedTips.push(...result.tips.slice(0, 2));
      });
      finalPlan = {
        ...templatePlan,
        planSource: "ai",
        itinerary: mergedItinerary,
        tips: combinedTips.length > 0 ? combinedTips : templatePlan.tips,
      };
    } else {
      finalPlan = templatePlan;
    }

    setPlan(finalPlan);
    setStep("result");
  };

  if (step === "generating") {
    const sc = STYLE_CONFIGS.find((s) => s.id === travelStyle)!;
    return <GeneratingStep styleConfig={sc} />;
  }

  if (step === "result" && plan) {
    return <ResultStep plan={plan} onBack={onBack} onRebuild={() => setStep("chat")} tabBarHeight={tabBarHeight} />;
  }

  return (
    <ChatStep
      onBack={onBack}
      originCity={originCity}
      preselectedDestination={preselectedDestination}
      onReady={handleReady}
      tabBarHeight={tabBarHeight}
    />
  );
}
