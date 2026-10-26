/**
 * Base URL for the custom Node backend (journey-backend/). Reads from
 * EXPO_PUBLIC_API_URL (see .env / .env.example) — the same class of
 * "your Mac's current LAN IP" fragility as the Expo dev server's own
 * exp:// URL, since your phone has to reach this over Wi-Fi the same way.
 * Update .env whenever your Mac's IP changes (`ipconfig getifaddr en0`).
 */
const LIVE_API_URL = "https://jourrrney-backend.onrender.com";

/**
 * If EXPO_PUBLIC_API_URL isn't set, a development run talks to a backend on this
 * computer, but an installed release (the Play Store build) talks to the live
 * server. That matters because .env is not part of EAS builds, so a production
 * build made without the variable would otherwise try to reach "localhost" on the
 * person's own phone and nothing in the app would load.
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? (__DEV__ ? "http://localhost:4000" : LIVE_API_URL);
