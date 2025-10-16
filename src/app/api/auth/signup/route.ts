import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, role = 'vendor' } = await request.json();

    console.log('Signup attempt for:', email, 'as', role);

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['vendor', 'auditor', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be vendor, auditor, or admin.' },
        { status: 400 }
      );
    }

    // Use regular Supabase client for signup (this will send confirmation email)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm`;
    console.log('Redirect URL:', redirectUrl);

    // Use admin.createUser to bypass email confirmation for development
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName,
        selected_role: role, // Store the selected role in metadata
      },
      email_confirm: true, // Auto-confirm email
    });

    console.log('Supabase signup response:', { data, error });

    if (error) {
      console.error('Signup error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.log('User created:', data.user?.id, 'Email confirmed:', data.user?.email_confirmed_at);

    // Create user profile immediately since email is auto-confirmed
    if (data.user) {
      await createUserProfile(supabase, data.user, fullName, role);
    }

    return NextResponse.json({
      message: 'Account created successfully! You can now sign in.',
      needsConfirmation: false,
      userId: data.user?.id,
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createUserProfile(supabase: any, user: any, fullName: string, role: string) {
  try {
    // Get the selected role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();

    if (roleError || !roleData) {
      console.error(`${role} role not found:`, roleError);
      return;
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        role_id: roleData.id,
      });

    if (profileError) {
      console.error('Failed to create user profile:', profileError);
    } else {
      console.log(`User profile created successfully with ${role} role`);
    }
  } catch (profileError) {
    console.error('Error creating user profile:', profileError);
  }
}