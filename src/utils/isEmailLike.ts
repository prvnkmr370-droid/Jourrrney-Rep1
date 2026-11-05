/** True when the text looks like an email address (something@something.xx). It only catches typos; the code that is emailed is the real check. */
export function isEmailLike(text: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text.trim());
}
