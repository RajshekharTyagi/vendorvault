import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create auditor user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName,
      },
      email_confirm: true, // Auto-confirm auditor
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Failed to create auditor user' },
        { status: 500 }
      );
    }

    // Get auditor role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'auditor')
      .single();

    if (roleError || !roleData) {
      return NextResponse.json(
        { error: 'Auditor role not found' },
        { status: 500 }
      );
    }

    // Create auditor user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
        role_id: roleData.id,
      });

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(data.user.id);
      return NextResponse.json(
        { error: 'Failed to create auditor profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Auditor user created successfully!',
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        role: 'auditor',
      },
    });

  } catch (error) {
    console.error('Auditor setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}