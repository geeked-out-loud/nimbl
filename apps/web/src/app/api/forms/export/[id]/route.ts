import { NextRequest, NextResponse } from 'next/server';
import { FormService, ResponseService } from '@nimbl/api';
import { ensureDBInitialized } from '@/lib/db-init';
import { getAuthUser } from '@/lib/auth/getAuthUser';

/**
 * POST /api/forms/export/:id
 * 
 * Export form responses as CSV or JSON
 * 
 * Body:
 * - format: 'csv' or 'json' (default: 'csv')
 * 
 * Returns:
 * - CSV: plain text with Content-Type: text/csv
 * - JSON: JSON string with Content-Type: application/json
 * 
 * Errors:
 * - 404: Form not found
 * - 403: User does not own this form
 * - 400: Invalid format parameter
 * - 500: Server error
 */
export async function POST(
  req: NextRequest,
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
    const body = await req.json();
    const format = body.format || 'csv';
    const userId = user.id;

    // Validate format
    if (!['csv', 'json'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be "csv" or "json"' },
        { status: 400 }
      );
    }

    // Verify form exists and user owns it
    try {
      await FormService.getForm(formId, userId);
    } catch (error: any) {
      if (error.message.includes('UNAUTHORIZED')) {
        return NextResponse.json(
          { error: 'You do not own this form' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Export based on format
    let data: string;
    let contentType: string;
    let filename: string;

    if (format === 'csv') {
      data = await ResponseService.exportResponsesAsCSV(formId, userId);
      contentType = 'text/csv';
      filename = `form-responses-${formId}.csv`;
    } else {
      data = await ResponseService.exportResponsesAsJSON(formId, userId);
      contentType = 'application/json';
      filename = `form-responses-${formId}.json`;
    }

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}
