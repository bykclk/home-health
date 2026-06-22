import { isSupabaseConfigured } from '@/lib/supabase';

/**
 * When true, the app runs entirely on the in-memory seed store (no auth, no
 * network) — used for UI work in Expo Go / web. Enabled explicitly via
 * EXPO_PUBLIC_USE_MOCK=1, or implicitly when Supabase env vars are missing.
 */
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === '1' || !isSupabaseConfigured;
