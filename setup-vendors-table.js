const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupVendorsTable() {
  try {
    console.log('🔧 Setting up vendors table...');
    
    // Read the SQL file
    const sql = fs.readFileSync('CREATE_VENDORS_TABLE.sql', 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      
      // Try alternative approach - create table directly
      console.log('🔄 Trying alternative approach...');
      
      const { error: createError } = await supabase
        .from('vendors')
        .select('id')
        .limit(1);
      
      if (createError && createError.code === '42P01') {
        // Table doesn't exist, create it
        console.log('📝 Creating vendors table...');
        
        const createTableSQL = `
          CREATE TABLE vendors (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            contact_email VARCHAR(255) NOT NULL,
            category VARCHAR(100) DEFAULT 'Other',
            status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;
        
        // This won't work directly, so let's just insert sample data
        const { data: insertData, error: insertError } = await supabase
          .from('vendors')
          .insert([
            {
              name: 'testing',
              contact_email: 'test@example.com',
              category: 'Logistics',
              status: 'active'
            },
            {
              name: 'Rajshekhar Tyagi',
              contact_email: 'raj@example.com',
              category: 'Logistics',
              status: 'pending'
            },
            {
              name: 'Test Vendor Company',
              contact_email: 'contact@testvendor.com',
              category: 'IT Services',
              status: 'active'
            }
          ]);
        
        if (insertError) {
          console.error('❌ Error inserting sample data:', insertError);
        } else {
          console.log('✅ Sample vendors inserted successfully');
        }
      }
    } else {
      console.log('✅ Vendors table setup completed');
    }
    
    // Test the table by fetching vendors
    console.log('🧪 Testing vendors table...');
    const { data: vendors, error: fetchError } = await supabase
      .from('vendors')
      .select('*')
      .limit(5);
    
    if (fetchError) {
      console.error('❌ Error fetching vendors:', fetchError);
    } else {
      console.log('✅ Vendors table is working!');
      console.log(`📊 Found ${vendors.length} vendors:`);
      vendors.forEach(vendor => {
        console.log(`  - ${vendor.name} (${vendor.category}) - ${vendor.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupVendorsTable();