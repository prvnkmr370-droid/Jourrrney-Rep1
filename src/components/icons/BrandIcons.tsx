/** Google/Facebook/Apple brand marks for the social sign-in buttons —
 * lucide-react-native has no brand icons, so these are hand-drawn SVGs. */
import Svg, { Path, Circle } from "react-native-svg";

export function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <Path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <Path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
      <Path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </Svg>
  );
}

export function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Circle cx={10} cy={10} r={10} fill="#1877F2" />
      <Path
        fill="#FFFFFF"
        d="M13.2 10.3h-2.1v6.4H8.6v-6.4H7.1V8.4h1.5V7.1c0-1.5.6-2.5 2.4-2.5h1.7v1.9h-1c-.7 0-.8.3-.8.8v1.1h1.9l-.2 1.9z"
      />
    </Svg>
  );
}

export function AppleIcon({ size = 18, color = "#000000" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 20" fill="none">
      <Path
        fill={color}
        d="M14.86 10.62c-.02-2.02 1.65-2.99 1.73-3.04-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.43.73-3.06.73-.63 0-1.6-.71-2.64-.69-1.34.02-2.58.78-3.27 1.98-1.39 2.41-.36 5.99 1 7.95.66.96 1.45 2.03 2.49 1.99 1-.04 1.38-.64 2.59-.64 1.21 0 1.55.64 2.61.62 1.08-.02 1.76-.98 2.42-1.95.76-1.11 1.08-2.19 1.09-2.25-.02-.01-2.09-.8-2.11-3.18z"
      />
      <Path
        fill={color}
        d="M12.6 4.42c.55-.67.93-1.6.82-2.53-.79.03-1.75.53-2.32 1.19-.51.59-.96 1.55-.84 2.46.89.07 1.8-.45 2.34-1.12z"
      />
    </Svg>
  );
}
