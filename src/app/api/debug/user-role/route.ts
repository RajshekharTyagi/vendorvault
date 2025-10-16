import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No auth header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get current user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user profile
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role_id,
        created_at,
        role:roles(id, name, description)
      `)
      .eq('id', authUser.id)
      .single();

    return NextResponse.json({
      auth_user: {
        id: authUser.id,
        email: authUser.email,
        metadata: authUser.user_metadata
      },
      db_user: dbUser,
      user_error: userError,
      debug_info: {
        user_found_in_db: !!dbUser,
        role_found: !!dbUser?.role,
        role_name: (dbUser?.role as any)?.name || 'NO ROLE'
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}