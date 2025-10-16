'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Home,
  Building2,
  FileText,
  CheckSquare,
  Bot,
  Shield,
  Settings,

} from 'lucide-react';

interface SidebarProps {
  userRole: 'admin' | 'vendor' | 'auditor';
}

const navigationItems = {
  vendor: [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Checklist', href: '/checklist', icon: CheckSquare },
    { name: 'AI Assistant', href: '/ai-assistant', icon: Bot },
    { name: 'Settings', href: '/settings', icon: Settings },
  ],
  admin: [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Vendors', href: '/vendors', icon: Building2 },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'AI Assistant', href: '/ai-assistant', icon: Bot },
    { name: 'Admin Panel', href: '/admin', icon: Shield },
    { name: 'Settings', href: '/settings', icon: Settings },
  ],
  auditor: [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Vendors', href: '/vendors', icon: Building2 },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'AI Assistant', href: '/ai-assistant', icon: Bot },
    { name: 'Settings', href: '/settings', icon: Settings },
  ],
};

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const items = navigationItems[userRole] || navigationItems.vendor;

  return (
    <div className="pb-12 w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="space-y-2 p-2">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start h-10",
                        isActive && "bg-blue-50 text-blue-700 border-blue-200"
                      )}
                      asChild
                    >
                      <Link href={item.href}>
                        <Icon className="mr-3 h-4 w-4" />
                        {item.name}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}