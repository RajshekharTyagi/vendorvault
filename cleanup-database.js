// Script to clean up old test data from your database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cmjlalbuuapamtpgqvub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtamxhbGJ1dWFwYW10cGdxdnViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ2ODQ4OSwiZXhwIjoyMDc2MDQ0NDg5fQ.Hl4AypUahspAuGp429-VpmCZnFLut4stW1u3oAr6t20';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...\n');

  try {
    // Get current data
    const { data: documents } = await supabase
      .from('documents')
      .select('*');

    const { data: vendors } = await supabase
      .from('vendors')
      .select('*');

    console.log(`Found ${documents?.length || 0} documents and ${vendors?.length || 0} vendors\n`);

    // Ask user what to clean up
    console.log('What would you like to clean up?');
    console.log('1. Delete all documents');
    console.log('2. Delete all vendors');
    console.log('3. Delete duplicate vendors only');
    console.log('4. Delete everything');
    console.log('5. Just show current data');

    // For now, let's just show the data and create individual cleanup functions
    console.log('\n📄 Current Documents:');
    documents?.forEach((doc, index) => {
      console.log(`  ${index + 1}. ID: ${doc.id} - ${doc.name} (${doc.status})`);
    });

    console.log('\n🏢 Current Vendors:');
    vendors?.forEach((vendor, index) => {
      console.log(`  ${index + 1}. ID: ${vendor.id} - ${vendor.name} (${vendor.status})`);
    });

    console.log('\n💡 To clean up specific items, use the functions below:');
    console.log('   - deleteAllDocuments()');
    console.log('   - deleteAllVendors()');
    console.log('   - deleteDuplicateVendors()');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function deleteAllDocuments() {
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .neq('id', 0); // Delete all records

    if (error) {
      console.error('❌ Error deleting documents:', error.message);
    } else {
      console.log('✅ All documents deleted successfully');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function deleteAllVendors() {
  try {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .neq('id', 0); // Delete all records

    if (error) {
      console.error('❌ Error deleting vendors:', error.message);
    } else {
      console.log('✅ All vendors deleted successfully');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function deleteDuplicateVendors() {
  try {
    // Keep only the most recent vendor for each name
    const { data: vendors } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    const seen = new Set();
    const toDelete = [];

    vendors?.forEach(vendor => {
      if (seen.has(vendor.name)) {
        toDelete.push(vendor.id);
      } else {
        seen.add(vendor.name);
      }
    });

    if (toDelete.length > 0) {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .in('id', toDelete);

      if (error) {
        console.error('❌ Error deleting duplicate vendors:', error.message);
      } else {
        console.log(`✅ Deleted ${toDelete.length} duplicate vendors`);
      }
    } else {
      console.log('✅ No duplicate vendors found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the main function
cleanupDatabase();

// Export functions for manual use
module.exports = {
  deleteAllDocuments,
  deleteAllVendors,
  deleteDuplicateVendors
};