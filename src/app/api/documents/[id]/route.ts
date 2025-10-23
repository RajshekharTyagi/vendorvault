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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient();
    const documentId = params.id;

    // First check if document exists
    const { data: existingDoc, error: fetchError } = await supabase
      .from('documents')
      .select('id, name')
      .eq('id', documentId)
      .single();

    if (fetchError || !existingDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      console.error('❌ Database delete failed:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete document from database' },
        { status: 500 }
      );
    }

    console.log('✅ Document deleted from database:', existingDoc.name);
    return NextResponse.json(
      { message: 'Document deleted successfully', id: documentId },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient();
    const documentId = params.id;

    // Try to fetch from Supabase
    const { data: document, error } = await supabase
      .from('documents')
      .select(`
        *,
        vendor:vendors(name)
      `)
      .eq('id', documentId)
      .single();

    if (error || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);

  } catch (error) {
    console.error('Get document API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient();
    const documentId = params.id;
    const body = await request.json();

    const { status, remarks, reviewed_at, reviewed_by } = body;

    // Validate status
    if (status && !['uploaded', 'verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Update document in database
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (remarks !== undefined) updateData.remarks = remarks;
    if (reviewed_at) updateData.reviewed_at = reviewed_at;
    if (reviewed_by) updateData.reviewed_by = reviewed_by;

    const { data: document, error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', documentId)
      .select('*')
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      );
    }

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Add vendor information
    const documentWithVendor = {
      ...document,
      vendor: { name: 'VendorVault Demo' }
    };

    console.log('✅ Document updated:', document.name, 'Status:', document.status);
    return NextResponse.json(documentWithVendor);

  } catch (error) {
    console.error('Update document API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}