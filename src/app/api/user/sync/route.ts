import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get auth header
    const authHeader = request.headers.get('authorization');
    let authUser;
    
    if (authHeader) {
      // Use token from header
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      authUser = user;
    } else {
      // Fallback to session-based auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
      authUser = user;
    }

    // Check if user profile exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .single();

    if (existingUser) {
      return NextResponse.json({ message: 'User profile already exists' });
    }

    // Get vendor role (default)
    const { data: vendorRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'vendor')
      .single();

    if (roleError || !vendorRole) {
      return NextResponse.json({ error: 'Vendor role not found' }, { status: 500 });
    }

    // Create user profile
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email!,
        full_name: authUser.user_metadata?.full_name || authUser.email!,
        role_id: vendorRole.id,
      });

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'User profile created successfully',
      user: {
        id: authUser.id,
        email: authUser.email,
        role: 'vendor'
      }
    });

  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}