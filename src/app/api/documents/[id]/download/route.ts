import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for API routes
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient();
    const documentId = params.id;

    // Fetch document from database
    const { data: document, error } = await supabase
      .from('documents')
      .select('name, file_type, file_content, file_size')
      .eq('id', documentId)
      .single();

    if (error || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (!document.file_content) {
      return NextResponse.json(
        { error: 'File content not available' },
        { status: 404 }
      );
    }

    // Convert base64 back to binary
    const fileBuffer = Buffer.from(document.file_content, 'base64');

    // Create response with proper headers for file download
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': document.file_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${document.name}"`,
        'Content-Length': document.file_size?.toString() || fileBuffer.length.toString(),
      },
    });

    return response;

  } catch (error) {
    console.error('Download API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}