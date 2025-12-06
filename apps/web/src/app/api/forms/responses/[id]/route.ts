import { NextRequest, NextResponse } from 'next/server';
import { ResponseService } from '@nimbl/api';
import { ensureDBInitialized } from '@/lib/db-init';
import { getAuthUser } from '@/lib/auth/getAuthUser';

// GET /api/forms/responses/:id - Get single response
export async function GET(
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

    const { id: responseId } = await params;

    if (!responseId) {
      return NextResponse.json(
        { error: 'Response ID is required' },
        { status: 400 }
      );
    }

    const userId = user.id;

    const response = await ResponseService.getResponse(responseId, userId);

    if (!response) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    if (error.message?.includes('UNAUTHORIZED')) {
      return NextResponse.json(
        { error: 'You do not have permission to view this response' },
        { status: 403 }
      );
    }
    console.error('Response get error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get response' },
      { status: 500 }
    );
  }
}

// DELETE /api/forms/responses/:id - Delete response
export async function DELETE(
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

    const { id: responseId } = await params;

    if (!responseId) {
      return NextResponse.json(
        { error: 'Response ID is required' },
        { status: 400 }
      );
    }

    const userId = user.id;

    await ResponseService.deleteResponse(responseId, userId);

    return NextResponse.json(
      { message: 'Response deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message?.includes('UNAUTHORIZED')) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this response' },
        { status: 403 }
      );
    }
    if (error.message?.includes('NOT_FOUND')) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      );
    }
    console.error('Response delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete response' },
      { status: 500 }
    );
  }
}
