'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Check if admin user exists
        const response = await fetch('/api/admin/check');
        const data = await response.json();

        if (data.adminExists) {
          // Admin exists, redirect to login or dashboard
          router.push('/login?admin=true');
        } else {
          // No admin exists, redirect to setup
          router.push('/admin/setup');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        // Default to setup if there's an error
        router.push('/admin/setup');
      }
    };

    checkAdminStatus();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-gray-600">Checking admin status...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}