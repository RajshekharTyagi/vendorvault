// Script to verify environment variables are properly set
// Run this in your Vercel deployment to check if env vars are accessible

console.log('🔍 Checking Environment Variables...');

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

let allPresent = true;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${envVar}: MISSING`);
    allPresent = false;
  }
});

if (allPresent) {
  console.log('🎉 All required environment variables are present!');
} else {
  console.log('⚠️  Some environment variables are missing. Please add them in Vercel dashboard.');
}

// Test Supabase connection
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('🔗 Testing Supabase connection...');
  
  fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/documents?select=count`, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
    }
  })
  .then(response => {
    if (response.ok) {
      console.log('✅ Supabase connection successful!');
    } else {
      console.log(`❌ Supabase connection failed: ${response.status} ${response.statusText}`);
    }
  })
  .catch(error => {
    console.log(`❌ Supabase connection error:`, error.message);
  });
}