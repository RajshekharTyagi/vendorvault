const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function testSpecificFile() {
  try {
    console.log('🤖 Testing specific file query...');
    
    const query = 'give a overview of "Rajshekhar_Tyagi_Resume2025.pdf" this file';
    
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
      console.log('📚 Sources:', data.sources?.join(', ') || 'None');
      console.log('\n💬 Full Response:');
      console.log(data.response);
      
      if (data.thinking) {
        console.log('\n🧠 AI Thinking Process:');
        console.log(data.thinking);
      }
      
      if (data.suggestions) {
        console.log('\n💡 Suggestions:');
        data.suggestions.forEach((suggestion, index) => {
          console.log(`${index + 1}. ${suggestion}`);
        });
      }
    } else {
      console.error(`❌ Request failed: ${response.status}`);
      const errorData = await response.json();
      console.error('Error:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSpecificFile();