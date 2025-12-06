import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/auth/server';

/**
 * Check if username is available
 * GET /api/auth/username/check?username=john_doe
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Validate username format
    const usernameRegex = /^[A-Za-z0-9._]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'Invalid username format' },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServer();

    // Check if username exists
    const { data, error } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found (username available)
      throw error;
    }

    return NextResponse.json({
      available: !data,
      username,
    });
  } catch (error: any) {
    console.error('Username check error:', error);
    return NextResponse.json(
      { error: 'Failed to check username' },
      { status: 500 }
    );
  }
}
