import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // For API routes, we can't set cookies, so we'll just ignore this
          },
          remove(name: string, options: any) {
            // For API routes, we can't remove cookies, so we'll just ignore this
          },
        },
      }
    );
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch checks with vendor information
    const { data: checks, error } = await supabase
      .from('checks')
      .select(`
        *,
        vendor:vendors(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch checks' }, { status: 500 });
    }

    return NextResponse.json(checks || []);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // For API routes, we can't set cookies, so we'll just ignore this
          },
          remove(name: string, options: any) {
            // For API routes, we can't remove cookies, so we'll just ignore this
          },
        },
      }
    );
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { vendor_id, check_name, status, evidence_url, comments, due_date } = body;

    // Insert new check
    const { data: check, error } = await supabase
      .from('checks')
      .insert({
        vendor_id,
        check_name,
        status: status || 'pending',
        evidence_url,
        comments,
        due_date,
        checked_by: user.id
      })
      .select(`
        *,
        vendor:vendors(name)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create check' }, { status: 500 });
    }

    return NextResponse.json(check);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}