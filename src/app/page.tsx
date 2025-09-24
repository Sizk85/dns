import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // Show dashboard content directly
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">
                Cloudflare DNS Manager
              </h1>
              
              <div className="hidden md:flex space-x-4">
                <span className="text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  ภาพรวม
                </span>
                <a href="/dns" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  DNS Records
                </a>
                {(user.role === 'admin' || user.role === 'owner') && (
                  <a href="/blacklist" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Blacklist
                  </a>
                )}
                {user.role === 'owner' && (
                  <a href="/users" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Users
                  </a>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.name || user.email} ({user.role})
              </span>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">
                  ออกจากระบบ
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="mt-1 text-sm text-gray-600">
              ยินดีต้อนรับ {user.name || user.email}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c0 2.21 1.79 4 4 4V7M4 7c0-2.21 1.79-4 4-4h8c0-2.21 1.79-4 4-4v4M4 7h16" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">DNS Records</dt>
                      <dd className="text-lg font-medium text-gray-900">-</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a href="/dns" className="font-medium text-cyan-700 hover:text-cyan-900">
                    จัดการ DNS Records
                  </a>
                </div>
              </div>
            </div>

            {(user.role === 'admin' || user.role === 'owner') && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Blacklist Rules</dt>
                        <dd className="text-lg font-medium text-gray-900">-</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="/blacklist" className="font-medium text-cyan-700 hover:text-cyan-900">
                      จัดการ Blacklist
                    </a>
                  </div>
                </div>
              </div>
            )}

            {user.role === 'owner' && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-lg font-medium text-gray-900">-</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="/users" className="font-medium text-cyan-700 hover:text-cyan-900">
                      จัดการผู้ใช้
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>กิจกรรมล่าสุดในระบบ</p>
              </div>
              <div className="mt-5">
                <div className="text-sm text-gray-500 text-center py-4">
                  ยังไม่มีกิจกรรม - จะแสดงหลังจากมีการทำงานในระบบ
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
