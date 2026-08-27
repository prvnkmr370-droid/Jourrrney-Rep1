/**
 * Base URL for the custom Node backend (journey-backend/). Reads from
 * EXPO_PUBLIC_API_URL (see .env / .env.example) — the same class of
 * "your Mac's current LAN IP" fragility as the Expo dev server's own
 * exp:// URL, since your phone has to reach this over Wi-Fi the same way.
 * Update .env whenever your Mac's IP changes (`ipconfig getifaddr en0`).
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";
