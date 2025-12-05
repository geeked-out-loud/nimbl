import { NextResponse } from "next/server";
import { FormService } from "@nimbl/api";
import { ensureDBInitialized } from "@/lib/db-init";

export async function POST(request: Request) {
  try {
    await ensureDBInitialized();
    const body = await request.json();
    
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const form = await FormService.createForm("user-123", { title: body.title });
    return NextResponse.json(form, { status: 201 });
  } catch (error: any) {
    console.error('Form creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create form' },
      { status: 500 }
    );
  }
}

