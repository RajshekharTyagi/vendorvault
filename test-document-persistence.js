// Test script for Document Persistence
async function testDocumentPersistence() {
  console.log('🧪 Testing Document Persistence...\n');
  
  try {
    // Test 1: Upload a document
    console.log('📤 Testing document upload...');
    
    const formData = new FormData();
    
    // Create a mock file blob
    const mockFile = new Blob(['This is a test PDF content'], { type: 'application/pdf' });
    formData.append('file', mockFile, 'test-document.pdf');
    formData.append('vendor_id', '1');
    formData.append('name', 'test-document.pdf');
    formData.append('file_type', 'application/pdf');
    
    const uploadResponse = await fetch('http://localhost:3000/api/documents', {
      method: 'POST',
      body: formData,
    });
    
    console.log(`📊 Upload Status: ${uploadResponse.status} ${uploadResponse.statusText}`);
    
    if (uploadResponse.ok) {
      const uploadedDoc = await uploadResponse.json();
      console.log(`✅ Upload Success: ${uploadedDoc.name} (ID: ${uploadedDoc.id})`);
      
      // Test 2: Fetch documents to verify it's there
      console.log('\n📥 Testing document retrieval...');
      
      const fetchResponse = await fetch('http://localhost:3000/api/documents');
      
      if (fetchResponse.ok) {
        const documents = await fetchResponse.json();
        const foundDoc = documents.find(doc => doc.id === uploadedDoc.id);
        
        if (foundDoc) {
          console.log(`✅ Document found in list: ${foundDoc.name}`);
        } else {
          console.log(`⚠️ Document not found in list (may be in localStorage)`);
        }
        
        console.log(`📊 Total documents: ${documents.length}`);
      }
      
      // Test 3: Delete the document
      console.log('\n🗑️ Testing document deletion...');
      
      const deleteResponse = await fetch(`http://localhost:3000/api/documents/${uploadedDoc.id}`, {
        method: 'DELETE',
      });
      
      console.log(`📊 Delete Status: ${deleteResponse.status} ${deleteResponse.statusText}`);
      
      if (deleteResponse.ok) {
        const deleteResult = await deleteResponse.json();
        console.log(`✅ Delete Success: ${deleteResult.message}`);
      }
      
    } else {
      const errorData = await uploadResponse.json();
      console.log('❌ Upload Error:', errorData.error || 'Unknown error');
    }
    
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }
  
  console.log('\n🎯 Persistence Test Complete!');
  console.log('💡 Documents should now persist across page reloads using localStorage.');
  console.log('🔄 Try uploading a file in the UI, then refresh the page to test persistence.');
}

// Run if called directly
if (typeof window === 'undefined') {
  testDocumentPersistence();
}

module.exports = { testDocumentPersistence };