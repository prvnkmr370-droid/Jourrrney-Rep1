/**
 * Tiny JSON-on-device storage for data that must survive closing the app
 * (saved trips). Web uses localStorage; native writes one file in the app's
 * document directory. The native module is loaded lazily so a client that
 * doesn't have it degrades to "not remembered after restart" instead of
 * crashing the screen that imported this (same lesson as expo-image-picker in
 * ChatStep.tsx). Every call swallows its own errors and returns null/false —
 * persistence is a convenience and must never break the screen using it.
 */
import { Platform } from "react-native";

type LegacyFileSystem = typeof import("expo-file-system/legacy");

async function loadFileSystem(): Promise<LegacyFileSystem | null> {
  try {
    const mod = await import("expo-file-system/legacy");
    const resolved = ((mod as unknown as { default?: LegacyFileSystem }).default ?? mod) as LegacyFileSystem;
    return resolved.documentDirectory ? resolved : null;
  } catch {
    return null;
  }
}

export async function readJson<T>(key: string): Promise<T | null> {
  try {
    if (Platform.OS === "web") {
      const raw = globalThis.localStorage?.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    }
    const fs = await loadFileSystem();
    if (!fs) return null;
    const uri = `${fs.documentDirectory}${key}.json`;
    const info = await fs.getInfoAsync(uri);
    if (!info.exists) return null;
    return JSON.parse(await fs.readAsStringAsync(uri)) as T;
  } catch {
    return null;
  }
}

export async function writeJson(key: string, value: unknown): Promise<boolean> {
  try {
    const text = JSON.stringify(value);
    if (Platform.OS === "web") {
      globalThis.localStorage?.setItem(key, text);
      return true;
    }
    const fs = await loadFileSystem();
    if (!fs) return false;
    await fs.writeAsStringAsync(`${fs.documentDirectory}${key}.json`, text);
    return true;
  } catch {
    return false;
  }
}
