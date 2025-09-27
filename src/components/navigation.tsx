'use client';

import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  role: 'user' | 'admin' | 'owner';
  name: string | null;
}

interface NavigationProps {
  user: User;
  currentPage?: string;
}

export function Navigation({ user, currentPage }: NavigationProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const isActive = (page: string) => currentPage === page;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => window.location.href = '/'} 
              className="text-xl font-semibold text-gray-900 hover:text-gray-700"
            >
              Cloudflare DNS Manager
            </button>
            
            <div className="hidden md:flex space-x-4">
              <button 
                onClick={() => window.location.href = '/'} 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('dashboard') 
                    ? 'text-gray-900 bg-gray-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                ภาพรวม
              </button>
              <button 
                onClick={() => window.location.href = '/dns'} 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('dns') 
                    ? 'text-gray-900 bg-gray-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                DNS Records
              </button>
              {(user.role === 'admin' || user.role === 'owner') && (
                <button 
                  onClick={() => window.location.href = '/blacklist'} 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('blacklist') 
                      ? 'text-gray-900 bg-gray-100' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Blacklist
                </button>
              )}
              {user.role === 'owner' && (
                <button 
                  onClick={() => window.location.href = '/users'} 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('users') 
                      ? 'text-gray-900 bg-gray-100' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Users
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user.name || user.email} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded hover:bg-gray-50"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
