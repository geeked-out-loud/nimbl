import { NextRequest, NextResponse } from 'next/server';
import { ResponseService } from '@nimbl/api';
import { ensureDBInitialized } from '@/lib/db-init';

// GET /api/forms/:id/responses - List responses for a form
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDBInitialized();
    const { id: formId } = await params;

    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // TODO: Get userId from auth token (Phase 2)
    const userId = 'test-user-123';

    const result = await ResponseService.listResponses(formId, userId, { page, limit });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error.message?.includes('UNAUTHORIZED')) {
      return NextResponse.json(
        { error: 'You do not have permission to view these responses' },
        { status: 403 }
      );
    }
    console.error('Response list error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list responses' },
      { status: 500 }
    );
  }
}
