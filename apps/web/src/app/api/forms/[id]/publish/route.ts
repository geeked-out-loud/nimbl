import { NextRequest, NextResponse } from 'next/server';
import { FormService } from '@nimbl/api';
import { ensureDBInitialized } from '@/lib/db-init';

// POST /api/forms/:id/publish - Publish a form
export async function POST(
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

    // TODO: Get userId from auth token (Phase 2)
    const userId = 'test-user-123';

    const form = await FormService.publishForm(formId, userId);

    return NextResponse.json(form, { status: 200 });
  } catch (error: any) {
    if (error.message?.includes('UNAUTHORIZED')) {
      return NextResponse.json(
        { error: 'You do not have permission to publish this form' },
        { status: 403 }
      );
    }
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }
    console.error('Form publish error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish form' },
      { status: 500 }
    );
  }
}
