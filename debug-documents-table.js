const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugDocumentsTable() {
  try {
    console.log('🔍 Debugging documents table...');
    
    // Check if documents table exists and has data
    console.log('\n📋 Checking documents table...');
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('❌ Error querying documents table:', error);
      console.log('💡 This might mean the documents table doesn\'t exist or has permission issues');
      return;
    }
    
    console.log(`✅ Documents table accessible`);
    console.log(`📊 Found ${documents?.length || 0} documents`);
    
    if (documents && documents.length > 0) {
      console.log('\n📄 Document details:');
      documents.forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.name || 'Unnamed'}`);
        console.log(`   - ID: ${doc.id}`);
        console.log(`   - Vendor ID: ${doc.vendor_id || 'None'}`);
        console.log(`   - File Type: ${doc.file_type || 'Unknown'}`);
        console.log(`   - Status: ${doc.status || 'Unknown'}`);
        console.log(`   - Has Content: ${doc.file_content ? 'Yes' : 'No'}`);
        console.log(`   - Created: ${doc.created_at}`);
        console.log('');
      });
    } else {
      console.log('📭 No documents found in the table');
      
      // Check if we can insert a test document
      console.log('\n🧪 Testing document insertion...');
      const testDoc = {
        name: 'Rajshekhar_Tyagi_Resume2025.pdf',
        file_type: 'application/pdf',
        file_content: Buffer.from('This is a test PDF content for Rajshekhar Tyagi resume').toString('base64'),
        status: 'uploaded',
        vendor_id: '1',
        uploaded_by: 'test-user'
      };
      
      const { data: insertedDoc, error: insertError } = await supabase
        .from('documents')
        .insert(testDoc)
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Error inserting test document:', insertError);
      } else {
        console.log('✅ Test document inserted successfully:', insertedDoc.name);
      }
    }
    
    // Also check vendors table for context
    console.log('\n👥 Checking vendors table...');
    const { data: vendors, error: vendorError } = await supabase
      .from('vendors')
      .select('id, name')
      .limit(5);
    
    if (vendorError) {
      console.error('❌ Error querying vendors:', vendorError);
    } else {
      console.log(`✅ Found ${vendors?.length || 0} vendors`);
      vendors?.forEach(vendor => {
        console.log(`   - ${vendor.name} (ID: ${vendor.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugDocumentsTable();