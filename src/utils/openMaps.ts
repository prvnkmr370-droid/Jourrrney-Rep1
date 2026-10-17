/** Opens a Google Maps search (the maps app if there is one, else the browser). */
import { Alert, Linking } from "react-native";
import { mapSearchUrl } from "@/utils/placeAddress";

export async function openMapSearch(query: string): Promise<void> {
  try {
    await Linking.openURL(mapSearchUrl(query));
  } catch {
    Alert.alert("Couldn't open maps", "Please check that a maps app or browser is available, then try again.");
  }
}
