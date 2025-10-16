'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Toaster } from '@/components/ui/toaster';
import { supabase } from '@/lib/supabase-client';
import { User } from '@/types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        
        if (error || !authUser) {
          router.push('/login');
          return;
        }

        // Use the /api/user/me endpoint which is more reliable
        try {
          const response = await fetch('/api/user/me');
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Fallback: create basic user data from auth user
            console.log('Using fallback user data for:', authUser.email);
            
            // Try to get the selected role from user metadata
            const selectedRole = authUser.user_metadata?.selected_role || 'vendor';
            let roleId = '550e8400-e29b-41d4-a716-446655440002'; // default to vendor
            
            // Map role names to IDs
            const roleMap = {
              'admin': '550e8400-e29b-41d4-a716-446655440001',
              'vendor': '550e8400-e29b-41d4-a716-446655440002',
              'auditor': '550e8400-e29b-41d4-a716-446655440003'
            };
            
            if (roleMap[selectedRole as keyof typeof roleMap]) {
              roleId = roleMap[selectedRole as keyof typeof roleMap];
            }
            
            const fallbackUser: User = {
              id: authUser.id,
              email: authUser.email!,
              full_name: authUser.user_metadata?.full_name || authUser.email!,
              role_id: roleId,
              role: {
                id: roleId,
                name: selectedRole,
                description: selectedRole === 'admin' ? 'Full system access and management' :
                           selectedRole === 'auditor' ? 'Read-only access for compliance review' :
                           'Limited access to own vendor data',
                created_at: new Date().toISOString(),
              },
              created_at: authUser.created_at,
              updated_at: new Date().toISOString(),
            };
            setUser(fallbackUser);
          }
        } catch (fetchError) {
          console.error('Failed to fetch user data:', fetchError);
          // Ultimate fallback
          const selectedRole = authUser.user_metadata?.selected_role || 'vendor';
          let roleId = '550e8400-e29b-41d4-a716-446655440002'; // default to vendor
          
          // Map role names to IDs
          const roleMap = {
            'admin': '550e8400-e29b-41d4-a716-446655440001',
            'vendor': '550e8400-e29b-41d4-a716-446655440002',
            'auditor': '550e8400-e29b-41d4-a716-446655440003'
          };
          
          if (roleMap[selectedRole as keyof typeof roleMap]) {
            roleId = roleMap[selectedRole as keyof typeof roleMap];
          }
          
          const fallbackUser: User = {
            id: authUser.id,
            email: authUser.email!,
            full_name: authUser.user_metadata?.full_name || authUser.email!,
            role_id: roleId,
            role: {
              id: roleId,
              name: selectedRole,
              description: selectedRole === 'admin' ? 'Full system access and management' :
                         selectedRole === 'auditor' ? 'Read-only access for compliance review' :
                         'Limited access to own vendor data',
              created_at: new Date().toISOString(),
            },
            created_at: authUser.created_at,
            updated_at: new Date().toISOString(),
          };
          setUser(fallbackUser);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={{
        email: user.email,
        full_name: user.full_name,
        role: user.role?.name || 'user'
      }} />
      <div className="flex">
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
          <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
            <Sidebar userRole={user.role?.name || 'vendor'} />
          </div>
        </div>
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1 pt-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </div>
  );
}