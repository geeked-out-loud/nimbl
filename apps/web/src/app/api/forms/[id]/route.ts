import { NextRequest, NextResponse } from 'next/server';
import { FormService } from '@nimbl/api';
import { ensureDBInitialized } from '@/lib/db-init';

// GET /api/forms/:id - Get single form
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

    // TODO: Get userId from auth token (Phase 2)
    const userId = 'test-user-123';

    const form = await FormService.getForm(formId, userId);

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(form, { status: 200 });
  } catch (error: any) {
    if (error.message?.includes('UNAUTHORIZED')) {
      return NextResponse.json(
        { error: 'You do not have permission to access this form' },
        { status: 403 }
      );
    }
    console.error('Form get error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get form' },
      { status: 500 }
    );
  }
}

// PUT /api/forms/:id - Update form
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDBInitialized();
    const { id: formId } = await params;
    const body = await request.json();

    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    // TODO: Get userId from auth token (Phase 2)
    const userId = 'test-user-123';

    const form = await FormService.updateForm(formId, userId, body);

    return NextResponse.json(form, { status: 200 });
  } catch (error: any) {
    if (error.message?.includes('UNAUTHORIZED')) {
      return NextResponse.json(
        { error: 'You do not have permission to update this form' },
        { status: 403 }
      );
    }
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }
    console.error('Form update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update form' },
      { status: 500 }
    );
  }
}

// DELETE /api/forms/:id - Delete form
export async function DELETE(
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

    await FormService.deleteForm(formId, userId);

    return NextResponse.json(
      { message: 'Form deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message?.includes('UNAUTHORIZED')) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this form' },
        { status: 403 }
      );
    }
    console.error('Form delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete form' },
      { status: 500 }
    );
  }
}
