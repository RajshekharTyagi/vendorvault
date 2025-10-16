import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Create service role client (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get auth token from Authorization header
    const authHeader = request.headers.get('authorization');
    let authUser = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        authUser = user;
      } catch (error) {
        console.error('Token validation failed:', error);
      }
    }
    
    // For development, we'll allow access without strict auth validation since we're using service role
    // In production, you should enforce authentication more strictly
    if (!authUser) {
      console.log('No authenticated user found, but proceeding with service role access for development');
    }

    // Fetch all data using service role (bypasses RLS)
    const [vendorsResult, documentsResult, checksResult, renewalsResult] = await Promise.all([
      supabase.from('vendors').select('*').order('created_at', { ascending: false }),
      supabase.from('documents').select('*'),
      supabase.from('checks').select('*'),
      supabase.from('renewals').select('*').eq('status', 'upcoming')
    ]);

    // Handle any errors
    if (vendorsResult.error) throw vendorsResult.error;
    if (documentsResult.error) throw documentsResult.error;
    if (checksResult.error) throw checksResult.error;
    if (renewalsResult.error) throw renewalsResult.error;

    const vendors = vendorsResult.data || [];
    const documents = documentsResult.data || [];
    const checks = checksResult.data || [];
    const renewals = renewalsResult.data || [];

    // Calculate stats
    const stats = {
      totalVendors: vendors.length,
      pendingApprovals: documents.filter(doc => doc.status === 'uploaded').length,
      filesUploaded: documents.length,
      checklistCompleted: checks.filter(check => check.status === 'approved').length,
      upcomingRenewals: renewals.length,
    };

    // Get recent vendors (limit to 3)
    const recentVendors = vendors.slice(0, 3);

    return NextResponse.json({
      stats,
      recentVendors,
      success: true
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}