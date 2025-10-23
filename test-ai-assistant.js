// Test script for VendorVault AI Assistant
const testQueries = [
  "What is VendorVault?",
  "Explain the user roles",
  "What features does VendorVault have?",
  "How is it built technically?",
  "What can the AI assistant do?",
  "How does compliance management work?"
];

async function testAIAssistant() {
  console.log('🧪 Testing VendorVault AI Assistant...\n');
  
  for (const query of testQueries) {
    try {
      console.log(`❓ Query: ${query}`);
      
      const response = await fetch('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          context: 'test',
          userRole: 'admin'
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Response: ${data.response.substring(0, 100)}...`);
        console.log(`📊 Confidence: ${Math.round(data.confidence * 100)}%`);
        console.log(`📚 Sources: ${data.sources.join(', ')}`);
        console.log('---\n');
      } else {
        console.log(`❌ Error: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

// Run if called directly
if (typeof window === 'undefined') {
  testAIAssistant();
}

module.exports = { testAIAssistant };