const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function testDocumentBasedChecklist() {
  try {
    console.log('📋 Testing Document-Based Compliance Checklist...');
    
    // First, check what documents we have
    console.log('\n📄 Checking uploaded documents...');
    const documentsResponse = await fetch(`${BASE_URL}/api/documents`);
    
    if (documentsResponse.ok) {
      const documentsData = await documentsResponse.json();
      const documents = documentsData.documents || [];
      
      console.log(`✅ Found ${documents.length} documents:`);
      documents.forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.name} (${doc.status}) - ${doc.file_type}`);
      });
      
      if (documents.length === 0) {
        console.log('⚠️  No documents found. The checklist will be empty.');
        console.log('💡 Upload some documents first to see compliance checks.');
        return;
      }
      
      // Test the checklist generation logic
      console.log('\n🔧 Testing checklist generation...');
      
      const generatedChecks = [];
      documents.forEach((doc) => {
        const checkName = `${doc.name} Compliance Review`;
        const check = {
          id: `doc-check-${doc.id}`,
          vendor_id: doc.vendor_id || '1',
          check_name: checkName,
          status: doc.status === 'verified' ? 'approved' : 
                  doc.status === 'rejected' ? 'rejected' : 'pending',
          evidence_url: `/documents/${doc.id}`,
          comments: `Compliance check for ${doc.name}`,
          created_at: doc.created_at,
        };
        generatedChecks.push(check);
      });
      
      console.log(`✅ Generated ${generatedChecks.length} compliance checks:`);
      generatedChecks.forEach((check, index) => {
        console.log(`${index + 1}. ${check.check_name} - ${check.status}`);
      });
      
      // Test categorization
      console.log('\n📊 Testing categorization...');
      const categories = {};
      
      generatedChecks.forEach(check => {
        let categoryName = 'Document Compliance';
        
        const checkNameLower = check.check_name.toLowerCase();
        
        if (checkNameLower.includes('resume') || checkNameLower.includes('cv')) {
          categoryName = 'Personnel Documents';
        } else if (checkNameLower.includes('syllabus') || checkNameLower.includes('curriculum')) {
          categoryName = 'Educational Documents';
        } else if (checkNameLower.includes('license') || checkNameLower.includes('certificate')) {
          categoryName = 'Legal & Certifications';
        }
        
        if (!categories[categoryName]) {
          categories[categoryName] = [];
        }
        categories[categoryName].push(check.check_name);
      });
      
      console.log('📋 Categories generated:');
      Object.entries(categories).forEach(([category, items]) => {
        console.log(`  ${category}: ${items.length} items`);
        items.forEach(item => console.log(`    - ${item}`));
      });
      
      // Calculate progress
      const approvedCount = generatedChecks.filter(c => c.status === 'approved').length;
      const progress = Math.round((approvedCount / generatedChecks.length) * 100);
      
      console.log('\n📈 Progress Summary:');
      console.log(`  Overall Progress: ${progress}%`);
      console.log(`  Approved: ${approvedCount}`);
      console.log(`  Pending: ${generatedChecks.filter(c => c.status === 'pending').length}`);
      console.log(`  Rejected: ${generatedChecks.filter(c => c.status === 'rejected').length}`);
      
    } else {
      console.error('❌ Failed to fetch documents:', documentsResponse.status);
    }
    
    console.log('\n🎉 Document-based checklist test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your Next.js development server is running:');
    console.log('   npm run dev');
  }
}

testDocumentBasedChecklist();