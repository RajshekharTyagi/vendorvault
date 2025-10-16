import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  if (!token_hash || type !== 'email') {
    return NextResponse.redirect(new URL('/login?error=invalid_confirmation_link', request.url));
  }

  const supabaseAdmin = createSupabaseAdmin();

  try {
    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      token_hash,
      type: 'email',
    });

    if (error) {
      console.error('Email verification error:', error);
      return NextResponse.redirect(new URL('/login?error=confirmation_failed', request.url));
    }

    if (data.user) {
      console.log('User confirmed email:', data.user.email);
      console.log('User metadata:', data.user.user_metadata);

      // Get the role from user metadata (set during signup)
      const selectedRole = data.user.user_metadata?.selected_role || 'vendor';
      console.log('Selected role from metadata:', selectedRole);

      // Get the role ID
      let { data: roleData, error: roleError } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('name', selectedRole)
        .single();

      if (roleError || !roleData) {
        console.error(`Role '${selectedRole}' not found:`, roleError);
        // Fallback to vendor role
        const { data: fallbackRole } = await supabaseAdmin
          .from('roles')
          .select('id')
          .eq('name', 'vendor')
          .single();
        
        if (fallbackRole) {
          roleData = fallbackRole;
        }
      }

      if (roleData) {
        // Check if user profile already exists
        const { data: existingUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!existingUser) {
          // Create user profile after email confirmation
          const { error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: data.user.user_metadata?.full_name || data.user.email!,
              role_id: roleData.id,
            });

          if (insertError) {
            console.error('Failed to create user profile:', insertError);
          } else {
            console.log(`User profile created with ${selectedRole} role`);
          }
        } else {
          console.log('User profile already exists');
        }
      }
    }

    return NextResponse.redirect(new URL('/login?confirmed=true', request.url));
  } catch (error) {
    console.error('Email confirmation error:', error);
    return NextResponse.redirect(new URL('/login?error=confirmation_failed', request.url));
  }
}