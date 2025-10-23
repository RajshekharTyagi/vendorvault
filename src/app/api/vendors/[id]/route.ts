import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for API routes with service role key
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient();
    const vendorId = params.id;

    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    if (error || !vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ vendor });

  } catch (error) {
    console.error('Get vendor API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient();
    const vendorId = params.id;
    const body = await request.json();

    const { name, contact_email, category, status } = body;

    // Validate required fields
    if (!name || !contact_email) {
      return NextResponse.json(
        { error: 'Missing required fields: name, contact_email' },
        { status: 400 }
      );
    }

    const { data: vendor, error } = await supabase
      .from('vendors')
      .update({
        name,
        contact_email,
        category,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', vendorId)
      .select('*')
      .single();

    if (error) {
      console.error('Database update failed:', error.message);
      return NextResponse.json(
        { error: 'Failed to update vendor in database' },
        { status: 500 }
      );
    }

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    console.log('✅ Vendor updated:', vendor.name);
    return NextResponse.json({ vendor });

  } catch (error) {
    console.error('Update vendor API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient();
    const vendorId = params.id;

    // First check if vendor exists
    const { data: existingVendor, error: fetchError } = await supabase
      .from('vendors')
      .select('id, name')
      .eq('id', vendorId)
      .single();

    if (fetchError || !existingVendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Delete the vendor
    const { error: deleteError } = await supabase
      .from('vendors')
      .delete()
      .eq('id', vendorId);

    if (deleteError) {
      console.error('Database delete failed:', deleteError.message);
      return NextResponse.json(
        { error: 'Failed to delete vendor from database' },
        { status: 500 }
      );
    }

    console.log('✅ Vendor deleted:', existingVendor.name);
    return NextResponse.json(
      { message: 'Vendor deleted successfully', id: vendorId },
      { status: 200 }
    );

  } catch (error) {
    console.error('Delete vendor API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}