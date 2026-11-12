/** Password rules for customer accounts, shared by the forms (live checklist) and the server. */

export const PASSWORD_MIN = 8;
/** Supabase Auth hashes with bcrypt, which ignores anything past 72 bytes. */
export const PASSWORD_MAX = 72;

export type PasswordRule = { id: string; label: string; test: (pw: string) => boolean };

export const PASSWORD_RULES: PasswordRule[] = [
  { id: "length", label: `At least ${PASSWORD_MIN} characters`, test: (pw) => pw.length >= PASSWORD_MIN },
  { id: "upper", label: "An uppercase letter (A–Z)", test: (pw) => /[A-Z]/.test(pw) },
  { id: "lower", label: "A lowercase letter (a–z)", test: (pw) => /[a-z]/.test(pw) },
  { id: "number", label: "A number (0–9)", test: (pw) => /\d/.test(pw) },
  { id: "symbol", label: "A symbol, like ! @ # $", test: (pw) => /[^A-Za-z0-9\s]/.test(pw) },
];

const COMMON = new Set([
  "password", "password1", "password123", "passw0rd", "12345678", "123456789", "1234567890",
  "qwerty123", "qwertyuiop", "iloveyou", "welcome1", "admin123", "letmein1", "abc12345", "meli1234",
]);

/** Returns the first problem with the password, or null if it's acceptable. */
export function passwordProblem(pw: string, email?: string): string | null {
  if (!pw) return "Enter a password.";
  if (pw !== pw.trim()) return "Remove spaces from the start or end of your password.";
  if (new TextEncoder().encode(pw).length > PASSWORD_MAX) return `Use ${PASSWORD_MAX} characters or fewer.`;
  const failed = PASSWORD_RULES.find((r) => !r.test(pw));
  if (failed) return `Your password needs ${failed.label.charAt(0).toLowerCase()}${failed.label.slice(1)}.`;
  if (COMMON.has(pw.toLowerCase())) return "That password is too common. Please choose another.";
  const local = email?.split("@")[0]?.toLowerCase();
  if (local && local.length >= 4 && pw.toLowerCase().includes(local)) return "Don't use your email name in your password.";
  return null;
}

/** 0–4 for the strength bar: rules met, plus a bonus for length. */
export function passwordScore(pw: string): number {
  if (!pw) return 0;
  const met = PASSWORD_RULES.filter((r) => r.test(pw)).length;
  if (met < PASSWORD_RULES.length) return Math.min(2, Math.floor(met / 2));
  return pw.length >= 14 ? 4 : pw.length >= 11 ? 3 : 2;
}

export const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
