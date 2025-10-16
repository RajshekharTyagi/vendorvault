import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from session
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    
    let authUser;
    if (accessToken) {
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      authUser = user;
    }
    
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { name, contact_email, category, status } = body;

    // Update vendor
    const { data: vendor, error } = await supabase
      .from('vendors')
      .update({
        name,
        contact_email,
        category,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ vendor });

  } catch (error) {
    console.error('Vendor update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update vendor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from session
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    
    let authUser;
    if (accessToken) {
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      authUser = user;
    }
    
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Delete vendor
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Vendor deletion error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete vendor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}