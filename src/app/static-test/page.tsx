export default function StaticTestPage() {
  return (
    <html>
      <head>
        <title>VendorVault - Static Test</title>
      </head>
      <body style={{ fontFamily: 'Arial, sans-serif', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ color: 'green' }}>✅ Static Page Working!</h1>
        <p>This is a completely static page to test Vercel deployment.</p>
        <p>If you can see this, the deployment is working.</p>
        <div style={{ marginTop: '20px' }}>
          <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Home</a>
          {' | '}
          <a href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Login</a>
          {' | '}
          <a href="/test" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Test</a>
        </div>
      </body>
    </html>
  );
}