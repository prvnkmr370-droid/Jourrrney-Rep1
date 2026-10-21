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

/** Opens turn-by-turn directions to a place; the maps app starts from where the phone is. */
export async function openMapDirections(destinationQuery: string): Promise<void> {
  try {
    await Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}`);
  } catch {
    Alert.alert("Couldn't open maps", "Please check that a maps app or browser is available, then try again.");
  }
}
