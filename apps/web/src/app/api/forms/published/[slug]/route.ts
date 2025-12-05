import { NextRequest, NextResponse } from 'next/server';
import { FormService } from '@nimbl/api';
import { ensureDBInitialized } from '@/lib/db-init';

// GET /api/forms/published/:slug - Get published form by slug (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await ensureDBInitialized();
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    const form = await FormService.getPublishedForm(slug);

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(form, { status: 200 });
  } catch (error: any) {
    console.error('Published form fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch form' },
      { status: 500 }
    );
  }
}
