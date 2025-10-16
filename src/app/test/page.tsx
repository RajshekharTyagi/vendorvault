export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600">✅ Deployment Working!</h1>
        <p className="text-gray-600 mt-4">VendorVault is successfully deployed on Vercel</p>
        <div className="mt-8 space-y-2 text-sm text-gray-500">
          <p>Environment Variables:</p>
          <p>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
          <p>SITE_URL: {process.env.NEXT_PUBLIC_SITE_URL ? '✅ Set' : '❌ Missing'}</p>
        </div>
        <div className="mt-6">
          <a 
            href="/login" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );
}