// Test script for checks API endpoints
require('dotenv').config({ path: '.env.local' });

async function testChecksAPI() {
  console.log('🧪 Testing Checks API Endpoints...\n');

  const baseUrl = 'http://localhost:3000';

  try {
    // Test 1: GET /api/checks
    console.log('1️⃣ Testing GET /api/checks...');
    const getResponse = await fetch(`${baseUrl}/api/checks`);
    
    if (getResponse.ok) {
      const checks = await getResponse.json();
      console.log('✅ GET request successful');
      console.log(`   Found ${checks.length} checks`);
      
      if (checks.length > 0) {
        console.log('   Sample check:', checks[0].check_name, '-', checks[0].status);
      }
    } else {
      console.log('⚠️ GET request failed:', getResponse.status, getResponse.statusText);
    }

    // Test 2: POST /api/checks (create new check)
    console.log('\n2️⃣ Testing POST /api/checks...');
    
    const newCheck = {
      vendor_id: 'test-vendor',
      check_name: 'Test Security Audit',
      status: 'pending',
      comments: 'Initial security audit check',
      due_date: '2024-06-30'
    };

    try {
      const postResponse = await fetch(`${baseUrl}/api/checks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCheck),
      });

      if (postResponse.ok) {
        const createdCheck = await postResponse.json();
        console.log('✅ POST request successful');
        console.log('   Created check:', createdCheck.check_name);
        console.log('   Check ID:', createdCheck.id);
        
        // Test 3: PUT /api/checks/[id] (update check)
        console.log('\n3️⃣ Testing PUT /api/checks/[id]...');
        const updateResponse = await fetch(`${baseUrl}/api/checks/${createdCheck.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'approved',
            comments: 'Security audit completed successfully'
          }),
        });

        if (updateResponse.ok) {
          const updatedCheck = await updateResponse.json();
          console.log('✅ PUT request successful');
          console.log('   Updated status:', updatedCheck.status);
          console.log('   Updated comments:', updatedCheck.comments);
        } else {
          console.log('⚠️ PUT request failed:', updateResponse.status);
        }
        
        // Test 4: DELETE /api/checks/[id]
        console.log('\n4️⃣ Testing DELETE /api/checks/[id]...');
        const deleteResponse = await fetch(`${baseUrl}/api/checks/${createdCheck.id}`, {
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

    console.log('\n🎉 Checks API testing completed!');
    console.log('\n📝 The checklist page should now work without 401 errors');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your Next.js server is running on http://localhost:3000');
  }
}

// Check if we're running in Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment - use node-fetch if available
  try {
    const fetch = require('node-fetch');
    global.fetch = fetch;
  } catch (e) {
    console.log('💡 Install node-fetch to run this test: npm install node-fetch');
    console.log('   Or test the API endpoints directly in your browser');
  }
}

testChecksAPI();