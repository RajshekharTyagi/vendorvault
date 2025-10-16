import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Try to get user from session cookies first
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;
    
    let authUser;
    
    if (accessToken) {
      // Try with access token from cookies
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      if (!error && user) {
        authUser = user;
      }
    }
    
    if (!authUser) {
      // Fallback to authorization header
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          authUser = user;
        }
      }
    }
    
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user profile with role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role_id,
        created_at,
        updated_at,
        role:roles(
          id,
          name,
          description,
          created_at
        )
      `)
      .eq('id', authUser.id)
      .single();

    if (userError || !userData) {
      // If user not found in database, create a fallback response
      console.log('User not found in database, creating fallback for:', authUser.email);
      
      // Get the selected role from user metadata
      const selectedRole = authUser.user_metadata?.selected_role || 'vendor';
      
      // Try to get the selected role from database
      const { data: roleData } = await supabase
        .from('roles')
        .select('id, name, description, created_at')
        .eq('name', selectedRole)
        .single();

      const fallbackRole = roleData || {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'vendor',
        description: 'Limited access to own vendor data',
        created_at: new Date().toISOString(),
      };

      return NextResponse.json({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email,
        role_id: fallbackRole.id,
        role: fallbackRole,
        created_at: authUser.created_at,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(userData);

  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}