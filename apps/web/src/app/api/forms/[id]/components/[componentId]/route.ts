import { NextRequest, NextResponse } from 'next/server';
import { FormService } from '@nimbl/api';
import { ensureDBInitialized } from '@/lib/db-init';
import { getAuthUser } from '@/lib/auth/getAuthUser';

// PUT /api/forms/:id/components/:componentId - Update component
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; componentId: string }> }
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

    const { id: formId, componentId } = await params;
    const body = await request.json();

    if (!formId || !componentId) {
      return NextResponse.json(
        { error: 'Form ID and Component ID are required' },
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

    // Update component
    const updateData = {
      type: body.type,
      x: body.x,
      y: body.y,
      w: body.w,
      h: body.h,
      props: body.props,
    };

    const result = await FormService.updateComponent(formId, userId, componentId, updateData);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error.message?.includes('UNAUTHORIZED')) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this form' },
        { status: 403 }
      );
    }
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { error: 'Form or component not found' },
        { status: 404 }
      );
    }
    console.error('Component update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update component' },
      { status: 500 }
    );
  }
}

// DELETE /api/forms/:id/components/:componentId - Remove component
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; componentId: string }> }
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

    const { id: formId, componentId } = await params;

    if (!formId || !componentId) {
      return NextResponse.json(
        { error: 'Form ID and Component ID are required' },
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

    await FormService.removeComponent(formId, userId, componentId);

    return NextResponse.json(
      { message: 'Component deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message?.includes('UNAUTHORIZED')) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this form' },
        { status: 403 }
      );
    }
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { error: 'Form or component not found' },
        { status: 404 }
      );
    }
    console.error('Component delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete component' },
      { status: 500 }
    );
  }
}
