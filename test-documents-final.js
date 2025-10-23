// Final test for documents API endpoints
const FormData = require('form-data');
const fs = require('fs');

async function testDocumentsAPI() {
  console.log('🧪 Testing Documents API Endpoints...\n');

  const baseUrl = 'http://localhost:3000';

  try {
    // Test 1: GET /api/documents
    console.log('1️⃣ Testing GET /api/documents...');
    const getResponse = await fetch(`${baseUrl}/api/documents`);
    
    if (getResponse.ok) {
      const documents = await getResponse.json();
      console.log('✅ GET request successful');
      console.log(`   Found ${documents.length} documents`);
      
      if (documents.length > 0) {
        console.log('   Sample document:', documents[0].name);
      }
    } else {
      console.log('⚠️ GET request failed:', getResponse.status, getResponse.statusText);
    }

    // Test 2: POST /api/documents (simulate file upload)
    console.log('\n2️⃣ Testing POST /api/documents...');
    
    // Create a mock file for testing
    const mockFileContent = 'This is a test PDF content';
    const mockFile = new Blob([mockFileContent], { type: 'application/pdf' });
    
    const formData = new FormData();
    formData.append('file', mockFile, 'test-document.pdf');
    formData.append('name', 'Test Document Upload');
    formData.append('file_type', 'application/pdf');
    formData.append('vendor_id', 'test-vendor');

    try {
      const postResponse = await fetch(`${baseUrl}/api/documents`, {
        method: 'POST',
        body: formData,
      });

      if (postResponse.ok) {
        const newDocument = await postResponse.json();
        console.log('✅ POST request successful');
        console.log('   Created document:', newDocument.name);
        console.log('   Document ID:', newDocument.id);
        
        // Test 3: DELETE the created document
        console.log('\n3️⃣ Testing DELETE /api/documents/[id]...');
        const deleteResponse = await fetch(`${baseUrl}/api/documents/${newDocument.id}`, {
          method: 'DELETE',
        });

        if (deleteResponse.ok) {
          console.log('✅ DELETE request successful');
        } else {
          console.log('⚠️ DELETE request failed:', deleteResponse.status);
        }
        
      } else {
        console.log('⚠️ POST request failed:', postResponse.status, postResponse.statusText);
        const errorText = await postResponse.text();
        console.log('   Error details:', errorText);
      }
    } catch (postError) {
      console.log('⚠️ POST request error:', postError.message);
    }

    console.log('\n🎉 API testing completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Run the SQL commands from SETUP_DATABASE.md in your Supabase dashboard');
    console.log('2. Start your Next.js development server: npm run dev');
    console.log('3. Test document upload in the browser');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your Next.js server is running on http://localhost:3000');
  }
}

// Check if we're running in Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment - use node-fetch
  const fetch = require('node-fetch');
  global.fetch = fetch;
  global.FormData = FormData;
  global.Blob = class Blob {
    constructor(parts, options) {
      this.parts = parts;
      this.type = options?.type || '';
    }
  };
}

testDocumentsAPI();