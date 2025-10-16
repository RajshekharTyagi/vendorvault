// Debug script to check user roles in database
// Run this with: node check-user-roles.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cmjlalbuuapamtpgqvub.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtamxhbGJ1dWFwYW10cGdxdnViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ2ODQ4OSwiZXhwIjoyMDc2MDQ0NDg5fQ.Hl4AypUahspAuGp429-VpmCZnFLut4stW1u3oAr6t20';

async function checkUserRoles() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🔍 Checking user roles in database...\n');

  try {
    // Check all roles
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (rolesError) {
      console.error('❌ Error fetching roles:', rolesError);
      return;
    }

    console.log('📋 Available roles:');
    roles.forEach(role => {
      console.log(`   ${role.name}: ${role.description}`);
    });
    console.log('');

    // Check all users with their roles
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        email,
        full_name,
        role_id,
        created_at,
        role:roles(name, description)
      `)
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    console.log('👥 Users and their roles:');
    users.forEach(user => {
      const roleName = user.role?.name || 'NO ROLE';
      console.log(`   ${user.email} (${user.full_name}): ${roleName}`);
    });

    // Check for users without roles
    const usersWithoutRoles = users.filter(user => !user.role);
    if (usersWithoutRoles.length > 0) {
      console.log('\n⚠️  Users without roles:');
      usersWithoutRoles.forEach(user => {
        console.log(`   ${user.email} - role_id: ${user.role_id}`);
      });
    }

  } catch (error) {
    console.error('❌ Database error:', error);
  }
}

checkUserRoles();