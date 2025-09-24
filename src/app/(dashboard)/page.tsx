import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Shield, Users } from 'lucide-react';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface DashboardStats {
  dnsRecords: number;
  blacklistRules: number;
  totalUsers: number;
}

interface AuditLog {
  id: number;
  action: string;
  target_type: string;
  target_id: string | null;
  created_at: string;
  actor: {
    id: number;
    email: string;
    name: string | null;
    role: string;
  };
}

interface User {
  id: number;
  email: string;
  role: 'user' | 'admin' | 'owner';
  name: string | null;
}

export default async function DashboardPage() {
  const user = await getSession();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-600">
          ยินดีต้อนรับ {user.name || user.email}
        </p>
      </div>

      {/* Stats Cards - Simplified for server component */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DNS Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              รายการทั้งหมด
            </p>
          </CardContent>
        </Card>

        {(['admin', 'owner'].includes(user.role)) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blacklist Rules</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                กฎทั้งหมด
              </p>
            </CardContent>
          </Card>
        )}

        {user.role === 'owner' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                ผู้ใช้ทั้งหมด
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity - Simplified */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>กิจกรรมล่าสุด 5 รายการ</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            ยังไม่มีกิจกรรม - จะแสดงหลังจากมีการทำงานในระบบ
          </p>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dns" className="group">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-600" />
                <span className="font-medium group-hover:text-blue-600">
                  จัดการ DNS
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {(['admin', 'owner'].includes(user.role)) && (
          <Link href="/blacklist" className="group">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  <span className="font-medium group-hover:text-orange-600">
                    จัดการ Blacklist
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {user.role === 'owner' && (
          <Link href="/users" className="group">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="font-medium group-hover:text-green-600">
                    จัดการผู้ใช้
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
