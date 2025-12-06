import { NextRequest, NextResponse } from 'next/server';
import { FormService } from '@nimbl/api';
import { ensureDBInitialized } from '@/lib/db-init';
import { getAuthUser } from '@/lib/auth/getAuthUser';

// POST /api/forms/:id/unpublish - Unpublish a form
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDBInitialized();
    
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: formId } = await params;

    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    const userId = user.id;

    const form = await FormService.unpublishForm(formId, userId);

    return NextResponse.json(form, { status: 200 });
  } catch (error: any) {
    if (error.message?.includes('UNAUTHORIZED')) {
      return NextResponse.json(
        { error: 'You do not have permission to unpublish this form' },
        { status: 403 }
      );
    }
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }
    console.error('Form unpublish error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unpublish form' },
      { status: 500 }
    );
  }
}
