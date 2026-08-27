import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import HomeScreen from "@/screens/HomeScreen/HomeScreen";

export default function HomeTab() {
  const tabBarHeight = useBottomTabBarHeight();
  return <HomeScreen tabBarHeight={tabBarHeight} />;
}
