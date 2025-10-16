// Quick script to create admin user
// Run this with: node create-admin.js

const adminData = {
  email: 'rajshekhar.2025.tsintern@gmail.com',
  password: 'tyagi@2002',
  fullName: 'Rajshekhar Tyagi'
};

async function createAdmin() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Admin created successfully!');
      console.log('Email:', adminData.email);
      console.log('Password:', adminData.password);
      console.log('Role: Admin');
      console.log('\nYou can now login at: http://localhost:3000/login');
    } else {
      console.error('❌ Error creating admin:', result.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

createAdmin();