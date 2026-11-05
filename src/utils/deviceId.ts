/**
 * A random id for this phone, made once and kept on it (SecureStore). It is not the person's name, email or
 * account. The app sends it with each AI request so the server can count a guest's free AI prompts (see
 * journey-backend/src/middleware/aiGuestLimit.js). Without secure storage (the web preview) it lasts for the visit.
 */
import * as SecureStore from "expo-secure-store";

const KEY = "journey.deviceId";
const LOOKS_RIGHT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let cached: string | null = null;

/** A random id in the usual 8-4-4-4-12 form. Used for the phone's id and for each prompt. */
export function newId(): string {
  const hex = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) out += "-";
    else if (i === 14) out += "4";
    else if (i === 19) out += hex[((Math.random() * 4) | 0) + 8];
    else out += hex[(Math.random() * 16) | 0];
  }
  return out;
}

export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  try {
    const saved = await SecureStore.getItemAsync(KEY);
    if (saved && LOOKS_RIGHT.test(saved)) return (cached = saved);
  } catch {
    // no secure storage here: fall through and use an id for this visit
  }
  cached = newId();
  try {
    await SecureStore.setItemAsync(KEY, cached);
  } catch {
    // keep the id in memory only
  }
  return cached;
}
