// Comprehensive debug script for user roles
// Run this with: node debug-user-roles.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cmjlalbuuapamtpgqvub.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtamxhbGJ1dWFwYW10cGdxdnViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ2ODQ4OSwiZXhwIjoyMDc2MDQ0NDg5fQ.Hl4AypUahspAuGp429-VpmCZnFLut4stW1u3oAr6t20';

async function debugUserRoles() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🔍 COMPREHENSIVE USER ROLE DEBUG\n');

  try {
    // 1. Check all roles
    console.log('1️⃣ ROLES TABLE:');
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (rolesError) {
      console.error('❌ Error fetching roles:', rolesError);
    } else {
      roles.forEach(role => {
        console.log(`   ${role.id} | ${role.name} | ${role.description}`);
      });
    }

    // 2. Check all auth users
    console.log('\n2️⃣ AUTH USERS:');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
    } else {
      console.log(`Found ${authUsers.users.length} auth users:`);
      authUsers.users.forEach(user => {
        console.log(`   ${user.id} | ${user.email} | ${user.user_metadata?.full_name || 'No name'}`);
      });
    }

    // 3. Check all database users
    console.log('\n3️⃣ DATABASE USERS:');
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('❌ Error fetching database users:', dbError);
    } else {
      console.log(`Found ${dbUsers.length} database users:`);
      dbUsers.forEach(user => {
        console.log(`   ${user.id} | ${user.email} | ${user.full_name} | role_id: ${user.role_id}`);
      });
    }

    // 4. Check users with their roles (join query)
    console.log('\n4️⃣ USERS WITH ROLES:');
    const { data: usersWithRoles, error: joinError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role_id,
        created_at,
        role:roles(name, description)
      `)
      .order('created_at', { ascending: false });

    if (joinError) {
      console.error('❌ Error fetching users with roles:', joinError);
    } else {
      usersWithRoles.forEach(user => {
        const roleName = user.role?.name || 'NO ROLE';
        console.log(`   ${user.email} (${user.full_name}) → ${roleName}`);
      });
    }

    // 5. Check for specific user (if provided)
    const targetEmail = 'tyagi@gmail.com'; // Change this to test specific user
    console.log(`\n5️⃣ SPECIFIC USER CHECK (${targetEmail}):`);
    
    const { data: specificUser, error: specificError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role_id,
        created_at,
        role:roles(name, description)
      `)
      .eq('email', targetEmail)
      .single();

    if (specificError) {
      console.log(`   User ${targetEmail} not found in database`);
    } else {
      console.log(`   Found: ${specificUser.email} → ${specificUser.role?.name || 'NO ROLE'}`);
      console.log(`   Role ID: ${specificUser.role_id}`);
    }

    // 6. Check for mismatched role IDs
    console.log('\n6️⃣ ROLE ID VALIDATION:');
    const roleIds = roles.map(r => r.id);
    const invalidUsers = dbUsers.filter(user => !roleIds.includes(user.role_id));
    
    if (invalidUsers.length > 0) {
      console.log('⚠️  Users with invalid role IDs:');
      invalidUsers.forEach(user => {
        console.log(`   ${user.email} has role_id: ${user.role_id} (not found in roles table)`);
      });
    } else {
      console.log('✅ All users have valid role IDs');
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

debugUserRoles();