// Client-safe exports only
// DO NOT export server.ts here - it uses next/headers and cannot be imported by client components
export { getSupabaseClient } from './client';
export { getSessionService } from './session';
export { useAuth } from './useAuth';
export type { AuthState, AuthListener } from './session';
