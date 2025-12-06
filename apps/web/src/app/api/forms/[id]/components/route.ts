import { NextRequest, NextResponse } from 'next/server';
import { FormService } from '@nimbl/api';
import { ensureDBInitialized } from '@/lib/db-init';
import { getAuthUser } from '@/lib/auth/getAuthUser';

// POST /api/forms/:id/components - Add component to form
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
    const body = await request.json();

    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    if (!body.type) {
      return NextResponse.json(
        { error: 'Component type is required' },
        { status: 400 }
      );
    }

    const userId = user.id;

    // Verify form exists and user owns it
    const form = await FormService.getForm(formId, userId);
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Create component object
    const component = {
      type: body.type,
      x: body.x || 0,
      y: body.y || 0,
      w: body.w || 1,
      h: body.h || 1,
      props: body.props || {},
    };

    const result = await FormService.addComponent(formId, userId, component);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes('UNAUTHORIZED')) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this form' },
        { status: 403 }
      );
    }
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }
    console.error('Component add error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add component' },
      { status: 500 }
    );
  }
}
