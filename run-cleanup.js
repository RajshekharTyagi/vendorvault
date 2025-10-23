// Run specific cleanup operations
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cmjlalbuuapamtpgqvub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtamxhbGJ1dWFwYW10cGdxdnViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ2ODQ4OSwiZXhwIjoyMDc2MDQ0NDg5fQ.Hl4AypUahspAuGp429-VpmCZnFLut4stW1u3oAr6t20';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteDuplicateVendors() {
  console.log('🧹 Cleaning up duplicate vendors...');
  
  try {
    // Get all vendors ordered by creation date (newest first)
    const { data: vendors } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    const seen = new Set();
    const toDelete = [];

    vendors?.forEach(vendor => {
      if (seen.has(vendor.name)) {
        toDelete.push(vendor.id);
        console.log(`  📝 Marking duplicate for deletion: ${vendor.name} (ID: ${vendor.id})`);
      } else {
        seen.add(vendor.name);
        console.log(`  ✅ Keeping: ${vendor.name} (ID: ${vendor.id})`);
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
        console.log(`✅ Successfully deleted ${toDelete.length} duplicate vendors`);
      }
    } else {
      console.log('✅ No duplicate vendors found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the cleanup
deleteDuplicateVendors();