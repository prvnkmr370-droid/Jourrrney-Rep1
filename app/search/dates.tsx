import { router } from "expo-router";
import TravelDates from "@/screens/Search/TravelDates";
import { useSearchStore } from "@/store/useSearchStore";

export default function SearchDatesRoute() {
  const setTravelDate = useSearchStore((s) => s.setTravelDate);

  const goToResults = (isoDate: string | null) => {
    setTravelDate(isoDate);
    router.push("/search/results");
  };

  return <TravelDates onSkip={() => goToResults(null)} onContinue={goToResults} />;
}
