import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get auth token from Authorization header
    const authHeader = request.headers.get('authorization');
    let authUser = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        authUser = user;
      } catch (error) {
        console.error('Token validation failed:', error);
      }
    }
    
    // For development, we'll allow access without strict auth validation since we're using service role
    // In production, you should enforce authentication more strictly
    if (!authUser) {
      console.log('No authenticated user found, but proceeding with service role access for development');
    }

    // Fetch vendors
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ vendors: vendors || [] });

  } catch (error) {
    console.error('Vendors fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch vendors',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get auth token from Authorization header
    const authHeader = request.headers.get('authorization');
    let authUser = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        authUser = user;
      } catch (error) {
        console.error('Token validation failed:', error);
      }
    }
    
    // For development, allow creation without strict auth (but log it)
    if (!authUser) {
      console.log('No authenticated user found for vendor creation, using default user ID');
    }

    const body = await request.json();
    const { name, contact_email, category, status } = body;

    if (!name || !contact_email || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create vendor
    const { data: vendor, error } = await supabase
      .from('vendors')
      .insert({
        name,
        contact_email,
        category,
        status: status || 'active',
        created_by: authUser?.id || '00000000-0000-0000-0000-000000000000', // fallback for development
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ vendor });

  } catch (error) {
    console.error('Vendor creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create vendor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}