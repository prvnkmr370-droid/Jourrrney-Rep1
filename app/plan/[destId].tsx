import { useLocalSearchParams, router } from "expo-router";
import PlanTrip from "@/screens/PlanTrip/PlanTrip";

export default function PlanModalRoute() {
  const { destId } = useLocalSearchParams<{ destId: string }>();
  return <PlanTrip preselectedId={destId} onBack={() => router.back()} />;
}
