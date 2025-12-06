'use client';

import { useState, useEffect } from 'react';
import { getSessionService, type AuthState } from './session';

/**
 * React Hook for Auth State
 * 
 * Usage:
 *   const { user, session, loading } = useAuth();
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    const sessionService = getSessionService();
    
    // Subscribe to auth changes
    const unsubscribe = sessionService.subscribe(setState);
    
    // Cleanup
    return unsubscribe;
  }, []);

  return state;
}
