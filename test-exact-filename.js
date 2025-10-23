const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function testExactFilename() {
  try {
    console.log('🤖 Testing exact filename query...');
    
    // Use the exact filename from the database
    const query = 'give me an overview of "Rajshekhar_Tyagi_Resume20255.pdf" this file';
    
    console.log(`📝 Query: "${query}"`);
    
    const response = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: query,
        context: 'dashboard',
        userRole: 'admin'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ AI Response:');
      console.log('📊 Documents found:', data.documentsFound || 0);
      console.log('🎯 Confidence:', Math.round((data.confidence || 0) * 100) + '%');
      console.log('\n💬 Full Response:');
      console.log(data.response);
    } else {
      console.error(`❌ Request failed: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testExactFilename();