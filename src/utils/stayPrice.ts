/**
 * Turns a stay price as written in destinations.ts ("₹1,000–₹2,500/night",
 * "₹500–₹25,000/night (estimate)", "Varies", "N/A" ...) into the pieces the
 * Where to stay page shows: a big amount, a small "a night", an "Estimate"
 * label, and one sentence a screen reader can read.
 *
 * Cautious by design: text it can't read as a nightly price is shown as
 * written (or as a plain-words version of "Varies" / "N/A") rather than
 * guessed at.
 */
export interface PriceParts {
  /** The headline: "₹1,000 – ₹2,500", "Price varies", or the original text. */
  main: string;
  /** "a night" when the text was a per-night range, otherwise empty. */
  unit: string;
  /** The price is marked "(estimate)" in the data. */
  estimate: boolean;
  /** Any other bracketed note, e.g. "incl. meals". */
  note: string;
  /** False for "Varies", "N/A" and other texts with no rupee amount. */
  hasAmount: boolean;
  /** One sentence for a screen reader. */
  spoken: string;
}

export function priceParts(raw: string): PriceParts {
  const text = (raw ?? "").trim();
  const estimate = /\(\s*estimate\s*\)/i.test(text);

  const night = /^(.*?)\s*\/\s*night\b(.*)$/i.exec(text);
  if (night && /₹\s*\d/.test(night[1])) {
    const range = night[1].replace(/\s*[–-]\s*/g, " – ").trim();
    const extra = /\(([^)]*)\)/.exec(night[2])?.[1]?.trim() ?? "";
    const note = /^estimate$/i.test(extra) ? "" : extra;
    const spoken = `${range.replace(" – ", " to ")} a night${estimate ? ", estimate" : ""}${note ? `, ${note}` : ""}`;
    return { main: range, unit: "a night", estimate, note, hasAmount: true, spoken };
  }

  const hasAmount = /₹\s*\d/.test(text);
  const plain = text.replace(/\s*\(\s*estimate\s*\)/i, "").trim();
  const main = hasAmount ? plain
    : /^varies$/i.test(plain) ? "Price varies"
    : /^(n\/a|—|-)$/i.test(plain) ? "Price not available"
    : plain;
  return { main, unit: "", estimate, note: "", hasAmount, spoken: `${main}${estimate ? ", estimate" : ""}` };
}
