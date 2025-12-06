'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/auth/client';
import { useAuth } from '@/lib/auth';

/**
 * Email Verification Banner
 * 
 * Shows when user has signed up but hasn't verified their email.
 * Provides a button to resend the verification email.
 */
export function EmailVerificationBanner() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show if user exists and email is not confirmed
  if (!user || user.email_confirmed_at) {
    return null;
  }

  const resendVerification = async () => {
    try {
      setSending(true);
      setError(null);

      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!,
      });

      if (error) throw error;

      setSent(true);
      setTimeout(() => setSent(false), 5000); // Hide success message after 5s
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📧</span>
          <div>
            <p className="text-sm font-medium text-yellow-900">
              Please verify your email address
            </p>
            <p className="text-xs text-yellow-700">
              We sent a verification link to <strong>{user.email}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {sent ? (
            <span className="text-sm text-green-700 font-medium">
              ✓ Email sent! Check your inbox
            </span>
          ) : (
            <button
              onClick={resendVerification}
              disabled={sending}
              className="px-4 py-1.5 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Resend Email'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto mt-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
