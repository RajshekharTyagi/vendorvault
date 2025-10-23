const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function testVendorsAPI() {
  try {
    console.log('🧪 Testing Vendors API...');
    
    // Test GET /api/vendors
    console.log('\n📋 Testing GET /api/vendors');
    const getResponse = await fetch(`${BASE_URL}/api/vendors`);
    const getData = await getResponse.json();
    
    if (getResponse.ok) {
      console.log('✅ GET /api/vendors successful');
      console.log(`📊 Found ${getData.vendors?.length || 0} vendors:`);
      getData.vendors?.forEach(vendor => {
        console.log(`  - ${vendor.name} (${vendor.category}) - ${vendor.status}`);
      });
    } else {
      console.error('❌ GET /api/vendors failed:', getData);
    }
    
    // Test POST /api/vendors
    console.log('\n📝 Testing POST /api/vendors');
    const newVendor = {
      name: 'API Test Vendor',
      contact_email: 'apitest@example.com',
      category: 'Testing',
      status: 'active'
    };
    
    const postResponse = await fetch(`${BASE_URL}/api/vendors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newVendor)
    });
    
    const postData = await postResponse.json();
    
    if (postResponse.ok) {
      console.log('✅ POST /api/vendors successful');
      console.log('📄 Created vendor:', postData.vendor);
    } else {
      console.error('❌ POST /api/vendors failed:', postData);
    }
    
    console.log('\n🎉 Vendors API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your Next.js development server is running:');
    console.log('   npm run dev');
  }
}

testVendorsAPI();