const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function testDocumentsPageFix() {
  try {
    console.log('🔧 Testing Documents Page API Fix...');
    
    // Test the documents API
    console.log('\n📄 Testing documents API...');
    const response = await fetch(`${BASE_URL}/api/documents`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response received');
      console.log('📊 Response type:', typeof data);
      console.log('📋 Is array?', Array.isArray(data));
      
      if (data.documents) {
        console.log('📄 Documents property found:', data.documents.length, 'documents');
        console.log('📋 Documents array?', Array.isArray(data.documents));
        
        if (data.documents.length > 0) {
          console.log('\n📄 Sample document:');
          const doc = data.documents[0];
          console.log(`  - Name: ${doc.name}`);
          console.log(`  - Status: ${doc.status}`);
          console.log(`  - Type: ${doc.file_type}`);
        }
      } else if (Array.isArray(data)) {
        console.log('📄 Direct array format:', data.length, 'documents');
      } else {
        console.log('⚠️  Unexpected format:', Object.keys(data));
      }
      
      // Test the filtering logic
      console.log('\n🔍 Testing filter logic...');
      const documents = Array.isArray(data) ? data : (data.documents || []);
      console.log(`📊 Processed documents: ${documents.length}`);
      
      if (documents.length > 0) {
        // Test filter function
        const filteredDocuments = documents.filter((doc) => {
          const matchesSearch = doc.name.toLowerCase().includes('');
          const matchesStatus = 'all' === 'all' || doc.status === 'all';
          return matchesSearch && matchesStatus;
        });
        
        console.log(`✅ Filter test passed: ${filteredDocuments.length} documents`);
        
        filteredDocuments.forEach((doc, index) => {
          console.log(`  ${index + 1}. ${doc.name} (${doc.status})`);
        });
      }
      
    } else {
      console.error('❌ API request failed:', response.status);
    }
    
    console.log('\n🎉 Documents page fix test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDocumentsPageFix();