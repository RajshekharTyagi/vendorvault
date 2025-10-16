// Complete fix for all user role issues
// Run this with: node complete-fix.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cmjlalbuuapamtpgqvub.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtamxhbGJ1dWFwYW10cGdxdnViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ2ODQ4OSwiZXhwIjoyMDc2MDQ0NDg5fQ.Hl4AypUahspAuGp429-VpmCZnFLut4stW1u3oAr6t20';

async function completeFix() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🔧 COMPLETE USER ROLE FIX\n');

  try {
    // 1. Get all roles
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*');

    if (rolesError) {
      console.error('❌ Error fetching roles:', rolesError);
      return;
    }

    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.name] = role.id;
    });

    console.log('📋 Available roles:');
    Object.keys(roleMap).forEach(roleName => {
      console.log(`   ${roleName}: ${roleMap[roleName]}`);
    });

    // 2. Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }

    console.log(`\n👥 Found ${authUsers.users.length} auth users`);

    // 3. Get all database users
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('*');

    if (dbError) {
      console.error('❌ Error fetching database users:', dbError);
      return;
    }

    console.log(`📊 Found ${dbUsers.length} database users`);

    // 4. Find missing users
    const dbUserIds = new Set(dbUsers.map(u => u.id));
    const missingUsers = authUsers.users.filter(authUser => !dbUserIds.has(authUser.id));

    if (missingUsers.length > 0) {
      console.log(`\n⚠️  Found ${missingUsers.length} users missing from database:`);
      
      for (const authUser of missingUsers) {
        console.log(`   Creating profile for: ${authUser.email}`);
        
        // Default to vendor role
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email,
            role_id: roleMap.vendor,
          });

        if (insertError) {
          console.error(`   ❌ Error creating profile for ${authUser.email}:`, insertError);
        } else {
          console.log(`   ✅ Created profile for ${authUser.email}`);
        }
      }
    } else {
      console.log('\n✅ All auth users have database profiles');
    }

    // 5. Check for invalid role IDs
    const validRoleIds = roles.map(r => r.id);
    const usersWithInvalidRoles = dbUsers.filter(user => !validRoleIds.includes(user.role_id));
    
    if (usersWithInvalidRoles.length > 0) {
      console.log(`\n⚠️  Found ${usersWithInvalidRoles.length} users with invalid role IDs:`);
      
      for (const user of usersWithInvalidRoles) {
        console.log(`   Fixing role for: ${user.email} (invalid role_id: ${user.role_id})`);
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ role_id: roleMap.vendor })
          .eq('id', user.id);

        if (updateError) {
          console.error(`   ❌ Error fixing role for ${user.email}:`, updateError);
        } else {
          console.log(`   ✅ Fixed role for ${user.email}`);
        }
      }
    } else {
      console.log('\n✅ All users have valid role IDs');
    }

    // 6. Show final status
    console.log('\n📊 FINAL STATUS:');
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select(`
        email,
        full_name,
        created_at,
        role:roles(name)
      `)
      .order('created_at', { ascending: false });

    if (finalError) {
      console.error('❌ Error fetching final status:', finalError);
    } else {
      finalUsers.forEach(user => {
        const roleName = user.role?.name || 'NO ROLE';
        const date = new Date(user.created_at).toLocaleString();
        console.log(`   ${user.email} (${user.full_name}) → ${roleName} | ${date}`);
      });
    }

    console.log('\n🎉 Complete fix finished!');
    console.log('\n💡 Next steps:');
    console.log('   1. Refresh your browser');
    console.log('   2. Sign out and back in');
    console.log('   3. Dashboard should now work properly');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

completeFix();