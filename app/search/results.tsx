import { router, useLocalSearchParams } from "expo-router";
import SearchResults from "@/screens/Search/SearchResults";

export default function SearchResultsRoute() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  return <SearchResults initialQuery={q} onSelectDestination={(d) => router.push(`/destination/${d.id}`)} />;
}
