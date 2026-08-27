import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import PlanTrip from "@/screens/PlanTrip/PlanTrip";

export default function PlanTab() {
  const tabBarHeight = useBottomTabBarHeight();
  return <PlanTrip tabBarHeight={tabBarHeight} />;
}
