const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read environment variables from .env.local
let supabaseUrl, supabaseServiceKey;
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseServiceKey = line.split('=')[1].trim();
    }
  }
} catch (error) {
  console.error('Error reading .env.local file:', error.message);
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSampleData() {
  try {
    console.log('Creating sample data...');

    // First, get existing vendors
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('id, name');

    if (vendorsError) {
      console.error('Error fetching vendors:', vendorsError);
      return;
    }

    if (!vendors || vendors.length === 0) {
      console.log('No vendors found. Please create vendors first.');
      return;
    }

    console.log(`Found ${vendors.length} vendors:`, vendors.map(v => v.name));

    // Create sample checks
    const sampleChecks = [
      {
        vendor_id: vendors[0].id,
        check_name: 'Business License',
        status: 'approved',
        comments: 'Valid until December 2025',
        due_date: '2025-12-31'
      },
      {
        vendor_id: vendors[0].id,
        check_name: 'Data Privacy Policy',
        status: 'pending',
        comments: 'Awaiting updated policy document',
        due_date: '2024-03-01'
      },
      {
        vendor_id: vendors[0].id,
        check_name: 'ISO 27001 Certification',
        status: 'approved',
        comments: 'Certificate verified and valid',
        due_date: '2024-08-15'
      },
      {
        vendor_id: vendors.length > 1 ? vendors[1].id : vendors[0].id,
        check_name: 'Insurance Certificate',
        status: 'rejected',
        comments: 'Coverage amount insufficient - needs $2M minimum',
        due_date: '2024-02-28'
      },
      {
        vendor_id: vendors.length > 1 ? vendors[1].id : vendors[0].id,
        check_name: 'Financial Statements',
        status: 'pending',
        comments: 'Requested Q4 2023 statements',
        due_date: '2024-02-15'
      },
      {
        vendor_id: vendors.length > 1 ? vendors[1].id : vendors[0].id,
        check_name: 'Security Compliance Audit',
        status: 'approved',
        comments: 'SOC 2 Type II report received and approved',
        due_date: '2024-12-31'
      }
    ];

    // Insert checks
    const { data: insertedChecks, error: checksError } = await supabase
      .from('checks')
      .insert(sampleChecks)
      .select();

    if (checksError) {
      console.error('Error creating checks:', checksError);
    } else {
      console.log(`Created ${insertedChecks.length} sample checks`);
    }

    // Create sample documents
    const sampleDocuments = [
      {
        vendor_id: vendors[0].id,
        name: 'Business_License_2024.pdf',
        file_url: '/documents/business_license.pdf',
        file_type: 'application/pdf',
        file_size: 1024000,
        status: 'verified',
        expires_on: '2025-12-31'
      },
      {
        vendor_id: vendors[0].id,
        name: 'ISO_27001_Certificate.pdf',
        file_url: '/documents/iso_certificate.pdf',
        file_type: 'application/pdf',
        file_size: 2048000,
        status: 'verified',
        expires_on: '2024-08-15'
      },
      {
        vendor_id: vendors.length > 1 ? vendors[1].id : vendors[0].id,
        name: 'Insurance_Policy_2024.pdf',
        file_url: '/documents/insurance_policy.pdf',
        file_type: 'application/pdf',
        file_size: 1536000,
        status: 'rejected',
        remarks: 'Coverage amount needs to be increased to $2M minimum',
        expires_on: '2024-12-31'
      },
      {
        vendor_id: vendors.length > 1 ? vendors[1].id : vendors[0].id,
        name: 'SOC2_Type2_Report.pdf',
        file_url: '/documents/soc2_report.pdf',
        file_type: 'application/pdf',
        file_size: 3072000,
        status: 'verified',
        expires_on: '2024-12-31'
      },
      {
        vendor_id: vendors.length > 1 ? vendors[1].id : vendors[0].id,
        name: 'Financial_Statements_Q4_2023.pdf',
        file_url: '/documents/financial_statements.pdf',
        file_type: 'application/pdf',
        file_size: 2560000,
        status: 'uploaded'
      }
    ];

    // Insert documents
    const { data: insertedDocs, error: docsError } = await supabase
      .from('documents')
      .insert(sampleDocuments)
      .select();

    if (docsError) {
      console.error('Error creating documents:', docsError);
    } else {
      console.log(`Created ${insertedDocs.length} sample documents`);
    }

    console.log('Sample data creation completed!');

  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

createSampleData();