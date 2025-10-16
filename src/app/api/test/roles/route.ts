import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users with their roles
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        email,
        full_name,
        created_at,
        role:roles(name, description)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'User roles test',
      total_users: users.length,
      users: users.map(user => ({
        email: user.email,
        name: user.full_name,
        role: (user.role as any)?.name || 'NO ROLE',
        created: new Date(user.created_at).toLocaleString()
      }))
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}