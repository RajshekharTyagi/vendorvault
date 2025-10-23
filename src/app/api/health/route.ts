import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseAnonKey,
      SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey,
    };

    // Test database connection
    let dbConnection = false;
    let documentCount = 0;
    let dbError = null;

    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { data, error } = await supabase
          .from('documents')
          .select('id', { count: 'exact' });

        if (error) {
          dbError = error.message;
        } else {
          dbConnection = true;
          documentCount = data?.length || 0;
        }
      } catch (error) {
        dbError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      environmentVariables: envCheck,
      database: {
        connected: dbConnection,
        documentCount,
        error: dbError
      },
      supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'Not set'
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}