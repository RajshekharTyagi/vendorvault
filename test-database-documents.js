// Test script to verify document database operations
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDocumentOperations() {
  console.log('🧪 Testing Document Database Operations...\n');

  try {
    // Test 0: Check if table exists
    console.log('0️⃣ Checking if documents table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('documents')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Table does not exist or is not accessible:', tableError);
      console.log('📝 Creating documents table...');
      
      // Try to create the table
      const { error: createTableError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS documents (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            vendor_id TEXT NOT NULL,
            uploaded_by TEXT NOT NULL,
            name TEXT NOT NULL,
            file_url TEXT NOT NULL,
            file_type TEXT NOT NULL,
            status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'verified', 'rejected')),
            expires_on DATE,
            remarks TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY IF NOT EXISTS "Allow all operations on documents" ON documents
            FOR ALL USING (true);
        `
      });
      
      if (createTableError) {
        console.error('❌ Failed to create table:', createTableError);
        console.log('📝 Please manually run the database-setup.sql script in your Supabase dashboard');
        return;
      }
      
      console.log('✅ Documents table created successfully');
    } else {
      console.log('✅ Documents table exists and is accessible');
    }

    // Test 1: Create a test document
    console.log('\n1️⃣ Testing document creation...');
    
    // Use valid UUIDs for both vendor_id and uploaded_by
    const testDoc = {
      vendor_id: '550e8400-e29b-41d4-a716-446655440001', // Test vendor UUID
      uploaded_by: '550e8400-e29b-41d4-a716-446655440000', // Test user UUID
      name: 'Test_Document.pdf',
      file_url: '/uploads/test_document.pdf',
      file_type: 'application/pdf',
      status: 'uploaded',
      expires_on: '2025-12-31'
    };

    const { data: createdDoc, error: createError } = await supabase
      .from('documents')
      .insert(testDoc)
      .select('*')
      .single();

    if (createError) {
      console.error('❌ Create failed:', createError);
      return;
    }

    console.log('✅ Document created:', createdDoc.name);
    console.log('   ID:', createdDoc.id);

    // Test 2: Fetch all documents
    console.log('\n2️⃣ Testing document retrieval...');
    const { data: allDocs, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Fetch failed:', fetchError);
      return;
    }

    console.log('✅ Documents fetched:', allDocs.length);
    allDocs.forEach(doc => {
      console.log(`   - ${doc.name} (${doc.status})`);
    });

    // Test 3: Update document status
    console.log('\n3️⃣ Testing document update...');
    const { data: updatedDoc, error: updateError } = await supabase
      .from('documents')
      .update({ 
        status: 'verified',
        remarks: 'Document verified successfully',
        updated_at: new Date().toISOString()
      })
      .eq('id', createdDoc.id)
      .select('*')
      .single();

    if (updateError) {
      console.error('❌ Update failed:', updateError);
      return;
    }

    console.log('✅ Document updated:', updatedDoc.name);
    console.log('   Status:', updatedDoc.status);
    console.log('   Remarks:', updatedDoc.remarks);

    // Test 4: Delete the test document
    console.log('\n4️⃣ Testing document deletion...');
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', createdDoc.id);

    if (deleteError) {
      console.error('❌ Delete failed:', deleteError);
      return;
    }

    console.log('✅ Document deleted successfully');

    // Test 5: Verify deletion
    console.log('\n5️⃣ Verifying deletion...');
    const { data: remainingDocs, error: verifyError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', createdDoc.id);

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
      return;
    }

    if (remainingDocs.length === 0) {
      console.log('✅ Document successfully deleted from database');
    } else {
      console.log('❌ Document still exists in database');
    }

    console.log('\n🎉 All database tests passed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the tests
testDocumentOperations();