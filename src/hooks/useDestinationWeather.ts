/**
 * Live weather for a destination, via Open-Meteo's free forecast API
 * (https://open-meteo.com — no API key, no account, CORS-friendly, and
 * within its published free-tier terms for an app like this). This is a
 * real network call returning real current conditions — not fabricated —
 * but the "safe to travel" verdict below it is this app's own simple
 * heuristic (heavy rain/thunderstorms/high wind/extreme temperature),
 * not an official advisory, and is labelled as such in the UI.
 */
import { useEffect, useState } from "react";
import { DESTINATION_COORDS } from "@/data/destinationCoords";

export type WeatherSeverity = "clear" | "caution" | "severe";

export interface DestinationWeather {
  tempC: number;
  windKph: number;
  condition: string;
  emoji: string;
  severity: WeatherSeverity;
  verdict: string;
}

interface WeatherState {
  loading: boolean;
  error: boolean;
  weather: DestinationWeather | null;
}

// WMO weather codes, as returned by Open-Meteo's `weather_code` field.
function describeCode(code: number): { label: string; emoji: string; severity: WeatherSeverity } {
  if ([95, 96, 99].includes(code)) return { label: "Thunderstorm", emoji: "⛈️", severity: "severe" };
  if ([65, 67, 75, 77, 82].includes(code)) return { label: "Heavy rain/snow", emoji: "🌧️", severity: "severe" };
  if ([55, 56, 57, 63, 73, 81, 86].includes(code)) return { label: "Moderate rain/snow", emoji: "🌦️", severity: "caution" };
  if ([51, 53, 61, 71, 80, 85].includes(code)) return { label: "Light rain/snow", emoji: "🌦️", severity: "clear" };
  if ([45, 48].includes(code)) return { label: "Fog", emoji: "🌫️", severity: "caution" };
  if ([1, 2, 3].includes(code)) return { label: "Partly cloudy", emoji: "⛅", severity: "clear" };
  return { label: "Clear sky", emoji: "☀️", severity: "clear" };
}

function buildVerdict(severity: WeatherSeverity, tempC: number, windKph: number): { severity: WeatherSeverity; verdict: string } {
  let s = severity;
  if (windKph > 40 || tempC >= 45 || tempC <= -2) s = "severe";
  else if (s === "clear" && (windKph > 25 || tempC >= 40 || tempC <= 2)) s = "caution";

  if (s === "severe") return { severity: s, verdict: "Not ideal for travel right now" };
  if (s === "caution") return { severity: s, verdict: "Safe, but plan around the weather" };
  return { severity: s, verdict: "Good conditions for travel" };
}

export function useDestinationWeather(destinationId: string): WeatherState {
  const [state, setState] = useState<WeatherState>({ loading: true, error: false, weather: null });

  useEffect(() => {
    const coords = DESTINATION_COORDS[destinationId];
    if (!coords) {
      setState({ loading: false, error: true, weather: null });
      return;
    }

    let cancelled = false;
    setState({ loading: true, error: false, weather: null });

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Weather API returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const current = data?.current;
        if (!current) throw new Error("Malformed weather response");

        const tempC: number = current.temperature_2m;
        const windKph: number = current.wind_speed_10m;
        const code: number = current.weather_code;
        const { label, emoji } = describeCode(code);
        const { severity, verdict } = buildVerdict(describeCode(code).severity, tempC, windKph);

        setState({
          loading: false,
          error: false,
          weather: { tempC, windKph, condition: label, emoji, severity, verdict },
        });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, error: true, weather: null });
      });

    return () => {
      cancelled = true;
    };
  }, [destinationId]);

  return state;
}
