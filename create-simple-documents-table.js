// Script to create a simple documents table without foreign key constraints
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDocumentsTable() {
  console.log('🔧 Creating simple documents table...\n');

  try {
    // Drop existing table if it exists
    console.log('1️⃣ Dropping existing documents table...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS documents CASCADE;'
    });

    if (dropError) {
      console.log('⚠️ Drop table warning (this is normal):', dropError.message);
    } else {
      console.log('✅ Existing table dropped');
    }

    // Create new simple table
    console.log('\n2️⃣ Creating new documents table...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE documents (
          id SERIAL PRIMARY KEY,
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
        
        -- Create indexes for better performance
        CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
        CREATE INDEX idx_documents_status ON documents(status);
        CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
        
        -- Enable Row Level Security
        ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
        
        -- Create policy to allow all operations (for demo)
        CREATE POLICY "Allow all operations on documents" ON documents
          FOR ALL USING (true);
      `
    });

    if (createError) {
      console.error('❌ Failed to create table:', createError);
      return;
    }

    console.log('✅ Documents table created successfully');

    // Test the new table
    console.log('\n3️⃣ Testing the new table...');
    const testDoc = {
      vendor_id: 'demo-vendor-1',
      uploaded_by: 'demo-user',
      name: 'Test_Document.pdf',
      file_url: '/uploads/test_document.pdf',
      file_type: 'application/pdf',
      status: 'uploaded'
    };

    const { data: createdDoc, error: insertError } = await supabase
      .from('documents')
      .insert(testDoc)
      .select('*')
      .single();

    if (insertError) {
      console.error('❌ Test insert failed:', insertError);
      return;
    }

    console.log('✅ Test document created:', createdDoc.name);

    // Clean up test document
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', createdDoc.id);

    if (deleteError) {
      console.log('⚠️ Failed to clean up test document:', deleteError);
    } else {
      console.log('✅ Test document cleaned up');
    }

    console.log('\n🎉 Documents table is ready for use!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
createDocumentsTable();