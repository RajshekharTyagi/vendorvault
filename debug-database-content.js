// Script to check what's actually in your Supabase database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cmjlalbuuapamtpgqvub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtamxhbGJ1dWFwYW10cGdxdnViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ2ODQ4OSwiZXhwIjoyMDc2MDQ0NDg5fQ.Hl4AypUahspAuGp429-VpmCZnFLut4stW1u3oAr6t20';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking database content...\n');

  try {
    // Check documents table
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (docError) {
      console.log('❌ Documents table error:', docError.message);
    } else {
      console.log(`📄 Documents table: ${documents.length} records`);
      documents.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc.name} (${doc.status}) - Created: ${doc.created_at}`);
      });
    }

    console.log('');

    // Check vendors table
    const { data: vendors, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (vendorError) {
      console.log('❌ Vendors table error:', vendorError.message);
    } else {
      console.log(`🏢 Vendors table: ${vendors.length} records`);
      vendors.forEach((vendor, index) => {
        console.log(`  ${index + 1}. ${vendor.name} (${vendor.status}) - Created: ${vendor.created_at}`);
      });
    }

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

checkDatabase();