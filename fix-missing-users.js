// Script to fix missing users in database
// Run this with: node fix-missing-users.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cmjlalbuuapamtpgqvub.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtamxhbGJ1dWFwYW10cGdxdnViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ2ODQ4OSwiZXhwIjoyMDc2MDQ0NDg5fQ.Hl4AypUahspAuGp429-VpmCZnFLut4stW1u3oAr6t20';

async function fixMissingUsers() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🔧 Checking for missing users...\n');

  try {
    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }

    console.log(`📋 Found ${authUsers.users.length} auth users`);

    // Get all users in the users table
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('id, email');

    if (dbError) {
      console.error('❌ Error fetching database users:', dbError);
      return;
    }

    console.log(`📋 Found ${dbUsers.length} users in database`);

    // Find missing users
    const dbUserIds = new Set(dbUsers.map(u => u.id));
    const missingUsers = authUsers.users.filter(authUser => !dbUserIds.has(authUser.id));

    if (missingUsers.length === 0) {
      console.log('✅ All auth users have database profiles');
      return;
    }

    console.log(`⚠️  Found ${missingUsers.length} missing users:`);
    missingUsers.forEach(user => {
      console.log(`   ${user.email} (${user.id})`);
    });

    // Get vendor role ID
    const { data: vendorRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'vendor')
      .single();

    if (roleError || !vendorRole) {
      console.error('❌ Vendor role not found:', roleError);
      return;
    }

    // Create missing user profiles
    console.log('\n🔧 Creating missing user profiles...');
    
    for (const authUser of missingUsers) {
      try {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email,
            role_id: vendorRole.id,
          });

        if (insertError) {
          console.error(`❌ Error creating profile for ${authUser.email}:`, insertError);
        } else {
          console.log(`✅ Created profile for ${authUser.email}`);
        }
      } catch (error) {
        console.error(`❌ Error creating profile for ${authUser.email}:`, error);
      }
    }

    console.log('\n🎉 User profile creation complete!');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

fixMissingUsers();