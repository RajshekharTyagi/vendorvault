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

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    
    console.log('🔍 Fetching vendors from database...');
    
    // Try to fetch vendors from database
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select(`
        id,
        name,
        contact_email,
        category,
        status,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database query failed:', error.message);
      return NextResponse.json(
        { error: 'Failed to fetch vendors from database. Please ensure the vendors table exists.' },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${vendors?.length || 0} vendors`);
    return NextResponse.json({ vendors: vendors || [] });

  } catch (error) {
    console.error('❌ Vendors API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    
    // Parse request body
    const body = await request.json();
    const { name, contact_email, category, status } = body;

    // Validate required fields
    if (!name || !contact_email) {
      return NextResponse.json(
        { error: 'Missing required fields: name, contact_email' },
        { status: 400 }
      );
    }

    // Insert vendor into database
    const { data: vendor, error: dbError } = await supabase
      .from('vendors')
      .insert({
        name,
        contact_email,
        category: category || 'Other',
        status: status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (dbError) {
      console.error('Database insert failed:', dbError.message);
      return NextResponse.json(
        { error: 'Failed to create vendor in database' },
        { status: 500 }
      );
    }

    console.log('✅ Vendor created:', vendor.name);
    return NextResponse.json({ vendor }, { status: 201 });

  } catch (error) {
    console.error('Vendors POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}