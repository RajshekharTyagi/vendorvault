// Simple test to check documents table structure and test basic operations
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDocuments() {
  console.log('🧪 Testing Documents with Current Table Structure...\n');

  try {
    // Test 1: Check existing documents
    console.log('1️⃣ Checking existing documents...');
    const { data: existingDocs, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .limit(5);

    if (fetchError) {
      console.error('❌ Fetch failed:', fetchError);
      return;
    }

    console.log('✅ Current documents in database:', existingDocs.length);
    if (existingDocs.length > 0) {
      console.log('   Sample document structure:');
      console.log('   ', JSON.stringify(existingDocs[0], null, 2));
    }

    // Test 2: Try to insert with existing vendor (if any exist)
    console.log('\n2️⃣ Testing document creation...');
    
    // First, let's check if there are any vendors
    const { data: vendors, error: vendorError } = await supabase
      .from('vendors')
      .select('id')
      .limit(1);

    let vendorId = '1'; // Default fallback
    if (!vendorError && vendors && vendors.length > 0) {
      vendorId = vendors[0].id;
      console.log('   Using existing vendor ID:', vendorId);
    } else {
      console.log('   No vendors table or no vendors found, using fallback ID');
    }

    const testDoc = {
      vendor_id: vendorId,
      uploaded_by: 'demo-user',
      name: 'API_Test_Document.pdf',
      file_url: '/uploads/api_test_document.pdf',
      file_type: 'application/pdf',
      status: 'uploaded'
    };

    const { data: createdDoc, error: createError } = await supabase
      .from('documents')
      .insert(testDoc)
      .select('*')
      .single();

    if (createError) {
      console.error('❌ Create failed:', createError);
      console.log('   This might be due to foreign key constraints');
      
      // Let's try to understand the table structure
      console.log('\n3️⃣ Checking table constraints...');
      const { data: constraints } = await supabase
        .rpc('get_table_constraints', { table_name: 'documents' })
        .catch(() => ({ data: null }));
      
      if (constraints) {
        console.log('   Table constraints:', constraints);
      } else {
        console.log('   Could not fetch constraints info');
      }
      
      return;
    }

    console.log('✅ Document created successfully:', createdDoc.name);
    console.log('   Document ID:', createdDoc.id);

    // Test 3: Update the document
    console.log('\n3️⃣ Testing document update...');
    const { data: updatedDoc, error: updateError } = await supabase
      .from('documents')
      .update({ 
        status: 'verified',
        remarks: 'Test document verified'
      })
      .eq('id', createdDoc.id)
      .select('*')
      .single();

    if (updateError) {
      console.error('❌ Update failed:', updateError);
    } else {
      console.log('✅ Document updated:', updatedDoc.status);
    }

    // Test 4: Delete the test document
    console.log('\n4️⃣ Testing document deletion...');
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', createdDoc.id);

    if (deleteError) {
      console.error('❌ Delete failed:', deleteError);
    } else {
      console.log('✅ Document deleted successfully');
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDocuments();