import { ReactNode } from 'react';

/**
 * Authentication has been removed from this project. SRAI now operates as a
 * fully public application — every visitor is treated as the same local
 * "guest" user. This stub keeps the existing `useAuth()` API surface intact so
 * components and pages that still read `user.id`, `isAdmin`, etc. keep working
 * without any further refactor.
 */

const GUEST_USER_ID = '00000000-0000-0000-0000-000000000000';

const guestUser = {
  id: GUEST_USER_ID,
  email: 'guest@srai.local',
  user_metadata: { full_name: 'Guest' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date(0).toISOString(),
} as any;

const noopAuth = {
  user: guestUser,
  session: null as any,
  isLoading: false,
  isAdmin: true,
  isRecruiter: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
};

export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useAuth() {
  return noopAuth;
}
