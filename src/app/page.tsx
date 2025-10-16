import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">VendorVault</h1>
        <p className="text-gray-600 mb-8">Secure vendor management and compliance tracking</p>
        
        <div className="space-y-4">
          <Link 
            href="/login"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
          
          <Link 
            href="/signup"
            className="block w-full border border-blue-600 text-blue-600 py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Environment Check:</p>
          <p>Supabase: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}</p>
          <p>Site URL: {process.env.NEXT_PUBLIC_SITE_URL ? '✅' : '❌'}</p>
        </div>
      </div>
    </div>
  );
}