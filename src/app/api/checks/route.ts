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
    
    // Get user ID from session or use a default for demo
    const authHeader = request.headers.get('authorization');
    let userId = 'demo-user'; // Default user for demo purposes
    
    // Try to get user from auth header if provided
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

    // Try to fetch checks from database
    let checks = [];
    try {
      const { data: dbChecks, error } = await supabase
        .from('checks')
        .select(`
          id,
          vendor_id,
          check_name,
          status,
          evidence_url,
          checked_by,
          comments,
          due_date,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      checks = dbChecks || [];
    } catch (error) {
      console.error('Database query failed:', error.message);
      return NextResponse.json(
        { error: 'Failed to fetch checks from database. Please ensure the checks table exists.' },
        { status: 500 }
      );
    }

    // Add vendor information (mock for now since we don't have vendors table)
    const checksWithVendor = checks.map(check => ({
      ...check,
      vendor: { name: 'VendorVault Demo' }
    }));

    return NextResponse.json(checksWithVendor);

  } catch (error) {
    console.error('Checks API error:', error);
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
    const { vendor_id, check_name, status, evidence_url, comments, due_date } = body;

    // Validate required fields
    if (!vendor_id || !check_name) {
      return NextResponse.json(
        { error: 'Missing required fields: vendor_id, check_name' },
        { status: 400 }
      );
    }

    // Get user ID from auth header or use demo user
    const authHeader = request.headers.get('authorization');
    let userId = 'demo-user';
    
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

    // Try to insert check into database
    let check;
    try {
      const { data: dbCheck, error: dbError } = await supabase
        .from('checks')
        .insert({
          vendor_id,
          check_name,
          status: status || 'pending',
          evidence_url: evidence_url || null,
          checked_by: userId,
          comments: comments || null,
          due_date: due_date || null,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (dbError) {
        throw dbError;
      }
      
      check = dbCheck;
    } catch (dbError) {
      console.error('Database operation failed:', dbError.message);
      return NextResponse.json(
        { error: 'Failed to create check in database' },
        { status: 500 }
      );
    }

    // Add vendor information
    const checkWithVendor = {
      ...check,
      vendor: { name: 'VendorVault Demo' }
    };

    console.log('✅ Check created:', check.check_name);
    return NextResponse.json(checkWithVendor, { status: 201 });

  } catch (error) {
    console.error('Checks POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}