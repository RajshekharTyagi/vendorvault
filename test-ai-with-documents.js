const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function testAIWithDocuments() {
  try {
    console.log('🤖 Testing AI Assistant with Document Analysis...');
    
    // Test queries that should trigger document analysis
    const testQueries = [
      "Can you give me an overview of the files that I uploaded?",
      "Tell me about my documents",
      "What documents do I have?",
      "Show me document details",
      "Analyze my uploaded files"
    ];
    
    for (const query of testQueries) {
      console.log(`\n📝 Testing query: "${query}"`);
      
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
        console.log('✅ AI Response received');
        console.log(`📊 Documents found: ${data.documentsFound || 0}`);
        console.log(`🎯 Confidence: ${Math.round((data.confidence || 0) * 100)}%`);
        console.log(`📚 Sources: ${data.sources?.join(', ') || 'None'}`);
        console.log(`💬 Response preview: ${data.response?.substring(0, 200)}...`);
        
        if (data.thinking) {
          console.log('🧠 AI Thinking process available');
        }
        
        if (data.suggestions) {
          console.log(`💡 Suggestions: ${data.suggestions.length} provided`);
        }
      } else {
        console.error(`❌ Request failed: ${response.status}`);
        const errorData = await response.json();
        console.error('Error:', errorData);
      }
    }
    
    console.log('\n🎉 AI Assistant document analysis test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your Next.js development server is running:');
    console.log('   npm run dev');
  }
}

testAIWithDocuments();