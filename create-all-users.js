// Script to create all user types for testing
// Run this with: node create-all-users.js

const users = [
  {
    type: 'admin',
    data: {
      email: 'rajshekhar.2025.tsintern@gmail.com',
      password: 'tyagi@2002',
      fullName: 'Rajshekhar Tyagi'
    }
  },
  {
    type: 'auditor',
    data: {
      email: 'auditor@vendorvault.com',
      password: 'auditor123',
      fullName: 'Auditor User'
    }
  },
  {
    type: 'vendor',
    data: {
      email: 'vendor@vendorvault.com',
      password: 'vendor123',
      fullName: 'Vendor User'
    }
  }
];

async function createUser(type, userData) {
  try {
    const endpoint = type === 'vendor' ? '/api/auth/signup' : `/api/${type}/setup`;
    
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ ${type.toUpperCase()} created successfully!`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Role: ${type}`);
    } else {
      console.error(`❌ Error creating ${type}:`, result.error);
    }
  } catch (error) {
    console.error(`❌ Network error creating ${type}:`, error.message);
  }
}

async function createAllUsers() {
  console.log('🚀 Creating all user types...\n');
  
  for (const user of users) {
    await createUser(user.type, user.data);
    console.log(''); // Empty line for readability
  }
  
  console.log('🎯 Login credentials:');
  console.log('Admin: rajshekhar.2025.tsintern@gmail.com / tyagi@2002');
  console.log('Auditor: auditor@vendorvault.com / auditor123');
  console.log('Vendor: vendor@vendorvault.com / vendor123');
  console.log('\nLogin at: http://localhost:3000/login');
}

createAllUsers();