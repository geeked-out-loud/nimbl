import { NextRequest, NextResponse } from 'next/server';
import { FormService } from '@nimbl/api';
import { ensureDBInitialized } from '@/lib/db-init';

// POST /api/forms - Create new form
export async function POST(request: NextRequest) {
  try {
    await ensureDBInitialized();
    const body = await request.json();

    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // TODO: Get userId from auth token (Phase 2)
    // For now, use hardcoded test user
    const userId = 'test-user-123';

    const form = await FormService.createForm(userId, {
      title: body.title.trim(),
      description: body.description || '',
    });

    return NextResponse.json(form, { status: 201 });
  } catch (error: any) {
    console.error('Form creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create form' },
      { status: 500 }
    );
  }
}

// GET /api/forms - List user's forms
export async function GET(request: NextRequest) {
  try {
    await ensureDBInitialized();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // TODO: Get userId from auth token (Phase 2)
    const userId = 'test-user-123';

    const result = await FormService.listForms(userId, { page, limit });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Form list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list forms' },
      { status: 500 }
    );
  }
}
