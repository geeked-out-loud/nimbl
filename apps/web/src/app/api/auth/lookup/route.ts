import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/auth/server';

/**
 * Get email by username (for login)
 * POST /api/auth/lookup
 * Body: { username: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServer();

    // Use RPC function to get email by username
    const { data, error } = await supabase
      .rpc('get_email_by_username', { input_username: username });

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ email: data });
  } catch (error: any) {
    console.error('Username lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup username' },
      { status: 500 }
    );
  }
}
