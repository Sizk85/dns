'use client';

import { useState, useEffect } from 'react';
import { Navigation } from './navigation';

interface User {
  id: number;
  email: string;
  role: 'user' | 'admin' | 'owner';
  name: string | null;
}

interface PageWrapperProps {
  children: React.ReactNode;
  currentPage?: string;
  title: string;
  description?: string;
}

export function PageWrapper({ children, currentPage, title, description }: PageWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const result = await response.json();

        if (result.ok) {
          setUser(result.data.user);
        } else {
          window.location.href = '/';
        }
      } catch (error) {
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

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
      <Navigation user={user} currentPage={currentPage} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
