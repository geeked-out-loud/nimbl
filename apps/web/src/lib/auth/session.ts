'use client';

import { getSupabaseClient } from './client';
import type { User, Session, AuthError } from '@supabase/supabase-js';

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

type AuthListener = (state: AuthState) => void;

/**
 * Session Service with Race Condition Protection
 * 
 * Handles:
 * - Single source of truth for auth state
 * - Debounced session refresh
 * - Mutex locks to prevent concurrent refresh
 * - Event broadcasting to all listeners
 * - Automatic token refresh before expiry
 */
class SessionService {
  private state: AuthState = {
    user: null,
    session: null,
    loading: true,
  };

  private listeners = new Set<AuthListener>();
  private refreshPromise: Promise<void> | null = null;
  private refreshTimeout: NodeJS.Timeout | null = null;
  private initPromise: Promise<void> | null = null;
  private authSubscription: { data: { subscription: { unsubscribe: () => void } } } | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initPromise = this.initialize();
    }
  }

  private async initialize() {
    const supabase = getSupabaseClient();

    // Get initial session
    const { data: { session: initialSession } } = await supabase.auth.getSession();
    this.updateState(initialSession?.user ?? null, initialSession);

    // Listen to auth changes and store subscription
    this.authSubscription = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      this.updateState(session?.user ?? null, session);
      this.scheduleRefresh(session);
    });

    // Schedule initial refresh if we have a session
    this.scheduleRefresh(initialSession);
  }

  private updateState(user: User | null, session: Session | null) {
    this.state = { user, session, loading: false };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Schedule token refresh 60s before expiry
   * Prevents race conditions by canceling existing timers
   */
  private scheduleRefresh(session: Session | null) {
    // Clear existing timeout
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }

    if (!session) return;

    const expiresAt = session.expires_at;
    if (!expiresAt) return;

    const expiresInMs = expiresAt * 1000 - Date.now();
    const refreshInMs = Math.max(0, expiresInMs - 60000); // 60s before expiry

    this.refreshTimeout = setTimeout(() => {
      this.refreshSession();
    }, refreshInMs);
  }

  /**
   * Refresh session with mutex lock to prevent concurrent calls
   */
  async refreshSession(): Promise<void> {
    // If already refreshing, return existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Acquire lock
    this.refreshPromise = (async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { session }, error } = await supabase.auth.refreshSession();

        if (error) throw error;

        this.updateState(session?.user ?? null, session);
        this.scheduleRefresh(session);
      } catch (error) {
        console.error('Session refresh failed:', error);
        // On refresh failure, clear session
        this.updateState(null, null);
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Get current auth state (waits for initialization)
   */
  async getState(): Promise<AuthState> {
    if (this.initPromise) {
      await this.initPromise;
    }
    return this.state;
  }

  /**
   * Get current session (synchronous, returns cached state)
   */
  getSession(): Session | null {
    return this.state.session;
  }

  /**
   * Get current user (synchronous, returns cached state)
   */
  getUser(): User | null {
    return this.state.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.state.user;
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.state);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Validate username format
   * Allowed: A-Z, a-z, 0-9, dot (.), underscore (_)
   * Length: 3-30 characters
   */
  private validateUsername(username: string): boolean {
    const usernameRegex = /^[A-Za-z0-9._]{3,30}$/;
    return usernameRegex.test(username);
  }

  /**
   * Validate email format
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if input is email or username
   */
  private isEmail(input: string): boolean {
    return input.includes('@');
  }

  /**
   * Sign in with email/username and password
   * Accepts either email OR username
   */
  async signIn(emailOrUsername: string, password: string): Promise<{ error: AuthError | null }> {
    const supabase = getSupabaseClient();
    
    // If input contains @, treat as email
    if (this.isEmail(emailOrUsername)) {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailOrUsername,
        password,
      });
      return { error };
    }
    
    // Otherwise, lookup email by username from API
    try {
      const response = await fetch('/api/auth/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: emailOrUsername }),
      });

      if (!response.ok) {
        return {
          error: {
            message: 'User not found',
            name: 'AuthError',
            status: 404,
          } as AuthError,
        };
      }

      const { email } = await response.json();

      // Sign in with the looked-up email
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      return {
        error: {
          message: 'Failed to sign in',
          name: 'AuthError',
          status: 500,
        } as AuthError,
      };
    }
  }

  /**
   * Sign up with email, username, and password
   */
  async signUp(
    email: string,
    username: string,
    password: string
  ): Promise<{ error: AuthError | null }> {
    const supabase = getSupabaseClient();
    
    // Validate email format
    if (!this.validateEmail(email)) {
      return {
        error: {
          message: 'Invalid email format',
          name: 'ValidationError',
          status: 400,
        } as AuthError,
      };
    }
    
    // Validate username format
    if (!this.validateUsername(username)) {
      return {
        error: {
          message: 'Username must be 3-30 characters and contain only letters, numbers, dots, and underscores',
          name: 'ValidationError',
          status: 400,
        } as AuthError,
      };
    }
    
    // TODO: Check username uniqueness via API call before signup
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    return { error };
  }

  /**
   * Sign in with OAuth (Google, GitHub)
   */
  async signInWithOAuth(provider: 'google' | 'github'): Promise<{ error: AuthError | null }> {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return { error };
  }

  /**
   * Sign out
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      this.updateState(null, null);
    }

    return { error };
  }

  /**
   * Cleanup (cancel timers)
   */
  destroy() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
    if (this.authSubscription) {
      this.authSubscription.data.subscription.unsubscribe();
      this.authSubscription = null;
    }
    this.listeners.clear();
  }
}

// Singleton instance
let sessionService: SessionService | null = null;

export function getSessionService(): SessionService {
  if (!sessionService) {
    sessionService = new SessionService();
  }
  return sessionService;
}

export type { AuthState, AuthListener };
