export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** False until the keys are added to .env.local; auth pages show a setup notice instead of failing. */
export const supabaseReady = Boolean(SUPABASE_URL && SUPABASE_KEY);
