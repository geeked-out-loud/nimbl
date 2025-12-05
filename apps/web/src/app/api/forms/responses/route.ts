import { NextRequest, NextResponse } from 'next/server';
import { ResponseService } from '@nimbl/api';
import { ensureDBInitialized } from '@/lib/db-init';

// POST /api/forms/responses - Submit form response
export async function POST(request: NextRequest) {
  try {
    await ensureDBInitialized();
    const body = await request.json();

    if (!body.formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    if (!body.values || typeof body.values !== 'object') {
      return NextResponse.json(
        { error: 'Form values are required' },
        { status: 400 }
      );
    }

    const response = await ResponseService.createResponse({
      formId: body.formId,
      values: body.values,
      meta: body.meta,
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes('VALIDATION_ERROR')) {
      return NextResponse.json(
        { error: error.message, details: (error as any).details },
        { status: 400 }
      );
    }
    if (error.message?.includes('NOT_FOUND')) {
      return NextResponse.json(
        { error: 'Form not found or is not published' },
        { status: 404 }
      );
    }
    console.error('Response creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit response' },
      { status: 500 }
    );
  }
}
