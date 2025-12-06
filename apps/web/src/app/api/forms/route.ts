import { NextRequest, NextResponse } from 'next/server';
import { FormService } from '@nimbl/api';
import { ensureDBInitialized } from '@/lib/db-init';
import { getAuthUser } from '@/lib/auth/getAuthUser';

// POST /api/forms - Create new form
export async function POST(request: NextRequest) {
  try {
    await ensureDBInitialized();
    
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const userId = user.id;

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

    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const userId = user.id;

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
