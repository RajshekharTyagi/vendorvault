import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Check if any admin users exist
    const { data: adminUsers, error } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (error) {
      console.error('Error checking admin users:', error);
      return NextResponse.json({ adminExists: false });
    }

    return NextResponse.json({ 
      adminExists: adminUsers && adminUsers.length > 0 
    });

  } catch (error) {
    console.error('Error in admin check:', error);
    return NextResponse.json({ adminExists: false });
  }
}