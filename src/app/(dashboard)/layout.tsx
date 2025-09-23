'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import Link from 'next/link';

interface User {
  id: number;
  email: string;
  role: 'user' | 'admin' | 'owner';
  name: string | null;
}

function Navigation({ user }: { user: User | null }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-semibold text-gray-900">
              Cloudflare DNS Manager
            </Link>
            
            <div className="hidden md:flex space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                ภาพรวม
              </Link>
              <Link
                href="/dns"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                DNS Records
              </Link>
              {(user.role === 'admin' || user.role === 'owner') && (
                <Link
                  href="/blacklist"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Blacklist
                </Link>
              )}
              {user.role === 'owner' && (
                <Link
                  href="/users"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Users
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user.name || user.email} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const result = await response.json();

        if (result.ok) {
          setUser(result.data.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">กำลังโหลด...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      
      <Toaster />
    </div>
  );
}
