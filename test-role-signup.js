// Test script for role-based signup
// Run this with: node test-role-signup.js

const testUsers = [
  {
    email: 'vendor.test@example.com',
    password: 'test123',
    fullName: 'Test Vendor',
    role: 'vendor'
  },
  {
    email: 'auditor.test@example.com',
    password: 'test123',
    fullName: 'Test Auditor',
    role: 'auditor'
  }
];

async function testRoleSignup(userData) {
  try {
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ ${userData.role.toUpperCase()} created successfully!`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Role: ${userData.role}`);
    } else {
      console.error(`❌ Error creating ${userData.role}:`, result.error);
    }
  } catch (error) {
    console.error(`❌ Network error creating ${userData.role}:`, error.message);
  }
}

async function testAllRoles() {
  console.log('🧪 Testing role-based signup...\n');
  
  for (const user of testUsers) {
    await testRoleSignup(user);
    console.log(''); // Empty line for readability
  }
  
  console.log('🎯 Test login credentials:');
  console.log('Vendor: vendor.test@example.com / test123');
  console.log('Auditor: auditor.test@example.com / test123');
  console.log('\nLogin at: http://localhost:3000/login');
}

testAllRoles();