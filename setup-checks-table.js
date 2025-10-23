// Script to create the checks table and verify it works
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupChecksTable() {
  console.log('🔧 Setting up checks table...\n');

  try {
    // Test 1: Check if checks table exists
    console.log('1️⃣ Testing if checks table exists...');
    const { data: existingChecks, error: fetchError } = await supabase
      .from('checks')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.log('❌ Checks table does not exist or is not accessible:', fetchError.message);
      console.log('📝 Please run the SQL commands from SUPABASE_SQL_COMMANDS.sql in your Supabase dashboard');
      console.log('\nRequired SQL:');
      console.log(`
CREATE TABLE IF NOT EXISTS checks (
  id SERIAL PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  check_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  evidence_url TEXT,
  checked_by TEXT,
  comments TEXT,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on checks" ON checks FOR ALL USING (true);
GRANT ALL ON checks TO anon;
GRANT ALL ON checks TO authenticated;
GRANT ALL ON SEQUENCE checks_id_seq TO anon;
GRANT ALL ON SEQUENCE checks_id_seq TO authenticated;
      `);
      return;
    }

    console.log('✅ Checks table exists and is accessible');
    console.log(`   Current checks in database: ${existingChecks?.length || 0}`);

    // Test 2: Try to insert a test check
    console.log('\n2️⃣ Testing check creation...');
    const testCheck = {
      vendor_id: '550e8400-e29b-41d4-a716-446655440000', // Use valid UUID format
      check_name: 'Test API Check',
      status: 'pending',
      comments: 'This is a test check created by the setup script',
      due_date: '2024-12-31'
    };

    const { data: createdCheck, error: createError } = await supabase
      .from('checks')
      .insert(testCheck)
      .select('*')
      .single();

    if (createError) {
      console.error('❌ Failed to create test check:', createError);
      return;
    }

    console.log('✅ Test check created successfully:', createdCheck.check_name);
    console.log('   Check ID:', createdCheck.id);

    // Test 3: Update the test check
    console.log('\n3️⃣ Testing check update...');
    const { data: updatedCheck, error: updateError } = await supabase
      .from('checks')
      .update({ 
        status: 'approved',
        comments: 'Test check approved by setup script',
        checked_by: 'setup-script'
      })
      .eq('id', createdCheck.id)
      .select('*')
      .single();

    if (updateError) {
      console.error('❌ Failed to update test check:', updateError);
      return;
    }

    console.log('✅ Test check updated successfully');
    console.log('   New status:', updatedCheck.status);
    console.log('   New comments:', updatedCheck.comments);

    // Test 4: Fetch all checks
    console.log('\n4️⃣ Testing check retrieval...');
    const { data: allChecks, error: fetchAllError } = await supabase
      .from('checks')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchAllError) {
      console.error('❌ Failed to fetch checks:', fetchAllError);
      return;
    }

    console.log('✅ Successfully fetched all checks');
    console.log(`   Total checks in database: ${allChecks.length}`);
    
    // Show recent checks
    console.log('\n   Recent checks:');
    allChecks.slice(0, 3).forEach(check => {
      console.log(`   - ${check.check_name} (${check.status})`);
    });

    // Test 5: Clean up test check
    console.log('\n5️⃣ Cleaning up test check...');
    const { error: deleteError } = await supabase
      .from('checks')
      .delete()
      .eq('id', createdCheck.id);

    if (deleteError) {
      console.log('⚠️ Failed to clean up test check:', deleteError);
    } else {
      console.log('✅ Test check cleaned up successfully');
    }

    console.log('\n🎉 Checks table is working properly!');
    console.log('📝 The checklist page should now show real data from the database');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupChecksTable();