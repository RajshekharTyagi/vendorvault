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
    const checkId = params.id;

    // Try to fetch from Supabase
    const { data: check, error } = await supabase
      .from('checks')
      .select('*')
      .eq('id', checkId)
      .single();

    if (error || !check) {
      return NextResponse.json(
        { error: 'Check not found' },
        { status: 404 }
      );
    }

    // Add vendor information
    const checkWithVendor = {
      ...check,
      vendor: { name: 'VendorVault Demo' }
    };

    return NextResponse.json(checkWithVendor);

  } catch (error) {
    console.error('Get check API error:', error);
    
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
    const checkId = params.id;
    const body = await request.json();

    const { status, comments, evidence_url, checked_by } = body;

    // Validate status
    if (status && !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Get user ID from auth header or use demo user
    const authHeader = request.headers.get('authorization');
    let userId = checked_by || 'demo-user';
    
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          userId = user.id;
        }
      } catch (authError) {
        console.log('Auth token invalid, using demo user');
      }
    }

    // Update check in database
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (comments !== undefined) updateData.comments = comments;
    if (evidence_url !== undefined) updateData.evidence_url = evidence_url;
    if (userId) updateData.checked_by = userId;

    let check;
    try {
      const { data: dbCheck, error } = await supabase
        .from('checks')
        .update(updateData)
        .eq('id', checkId)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      check = dbCheck;
    } catch (dbError) {
      console.error('Database update failed:', dbError.message);
      return NextResponse.json(
        { error: 'Failed to update check in database' },
        { status: 500 }
      );
    }

    if (!check) {
      return NextResponse.json(
        { error: 'Check not found' },
        { status: 404 }
      );
    }

    // Add vendor information
    const checkWithVendor = {
      ...check,
      vendor: { name: 'VendorVault Demo' }
    };

    console.log('✅ Check updated:', check.id, 'Status:', check.status);
    return NextResponse.json(checkWithVendor);

  } catch (error) {
    console.error('Update check API error:', error);
    
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
    const checkId = params.id;

    // Delete from Supabase
    const { error: deleteError } = await supabase
      .from('checks')
      .delete()
      .eq('id', checkId);

    if (deleteError) {
      console.error('Database delete failed:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete check from database' },
        { status: 500 }
      );
    }

    console.log('✅ Check deleted from database:', checkId);
    return NextResponse.json(
      { message: 'Check deleted successfully', id: checkId },
      { status: 200 }
    );

  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}