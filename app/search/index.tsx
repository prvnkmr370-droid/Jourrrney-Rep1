import { router } from "expo-router";
import OriginPrompt from "@/screens/Search/OriginPrompt";

export default function SearchOriginRoute() {
  return <OriginPrompt onContinue={() => router.push("/search/dates")} />;
}
