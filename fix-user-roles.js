// Script to fix incorrect user role assignments
// Run this with: node fix-user-roles.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cmjlalbuuapamtpgqvub.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtamxhbGJ1dWFwYW10cGdxdnViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ2ODQ4OSwiZXhwIjoyMDc2MDQ0NDg5fQ.Hl4AypUahspAuGp429-VpmCZnFLut4stW1u3oAr6t20';

// Define which users should have which roles
const roleCorrections = [
  // Add entries like: { email: 'user@example.com', correctRole: 'auditor' }
  // Example:
  // { email: 'tyagi@gmail.com', correctRole: 'auditor' },
];

async function fixUserRoles() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🔧 FIXING USER ROLES\n');

  try {
    // Get all roles for reference
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

    // If no specific corrections provided, ask user to check recent signups
    if (roleCorrections.length === 0) {
      console.log('\n🔍 Recent user signups (last 10):');
      const { data: recentUsers, error: recentError } = await supabase
        .from('users')
        .select(`
          email,
          full_name,
          created_at,
          role:roles(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentError) {
        console.error('❌ Error fetching recent users:', recentError);
      } else {
        recentUsers.forEach(user => {
          const roleName = user.role?.name || 'NO ROLE';
          const date = new Date(user.created_at).toLocaleString();
          console.log(`   ${user.email} (${user.full_name}) → ${roleName} | ${date}`);
        });
      }

      console.log('\n💡 To fix specific users, edit the roleCorrections array in this script.');
      console.log('   Example: { email: "user@example.com", correctRole: "auditor" }');
      return;
    }

    // Apply corrections
    console.log('\n🔧 Applying role corrections:');
    for (const correction of roleCorrections) {
      const { email, correctRole } = correction;
      const roleId = roleMap[correctRole];

      if (!roleId) {
        console.error(`❌ Role "${correctRole}" not found for ${email}`);
        continue;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({ role_id: roleId })
        .eq('email', email);

      if (updateError) {
        console.error(`❌ Error updating ${email}:`, updateError);
      } else {
        console.log(`✅ Updated ${email} to ${correctRole}`);
      }
    }

    console.log('\n🎉 Role corrections complete!');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

fixUserRoles();