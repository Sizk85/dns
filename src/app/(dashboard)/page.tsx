'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Database, Shield, Users } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';

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

export default function DashboardPage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    dnsRecords: 0,
    blacklistRules: 0,
    totalUsers: 0,
  });
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const result = await response.json();
      if (result.ok) {
        setUser(result.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [dnsRes, blacklistRes, usersRes] = await Promise.all([
        fetch('/api/dns/records'),
        fetch('/api/blacklist').catch(() => null),
        fetch('/api/users').catch(() => null),
      ]);

      const dnsData = await dnsRes.json();
      const blacklistData = blacklistRes ? await blacklistRes.json() : { ok: false };
      const usersData = usersRes ? await usersRes.json() : { ok: false };

      setStats({
        dnsRecords: dnsData.ok ? dnsData.data.items.length : 0,
        blacklistRules: blacklistData.ok ? blacklistData.data.items.length : 0,
        totalUsers: usersData.ok ? usersData.data.items.length : 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchRecentLogs = async () => {
    try {
      const response = await fetch('/api/audit?limit=5');
      const result = await response.json();
      if (result.ok) {
        setRecentLogs(result.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUser(),
        fetchStats(),
        fetchRecentLogs(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const getActionBadgeColor = (action: string) => {
    if (action.includes('create')) return 'bg-green-100 text-green-800';
    if (action.includes('update')) return 'bg-blue-100 text-blue-800';
    if (action.includes('delete')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatAction = (action: string) => {
    const actionMap: Record<string, string> = {
      'dns.create': 'สร้าง DNS Record',
      'dns.update': 'อัปเดต DNS Record',
      'dns.delete': 'ลบ DNS Record',
      'blacklist.create': 'สร้างกฎ Blacklist',
      'blacklist.update': 'อัปเดตกฎ Blacklist',
      'blacklist.delete': 'ลบกฎ Blacklist',
      'user.role_change': 'เปลี่ยนบทบาทผู้ใช้',
      'user.deactivate': 'ปิดการใช้งานผู้ใช้',
      'user.activate': 'เปิดการใช้งานผู้ใช้',
      'auth.login': 'เข้าสู่ระบบ',
      'auth.logout': 'ออกจากระบบ',
    };
    return actionMap[action] || action;
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-600">
          ยินดีต้อนรับ {user?.name || user?.email}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DNS Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.dnsRecords}</div>
            )}
            <p className="text-xs text-muted-foreground">
              รายการทั้งหมด
            </p>
          </CardContent>
        </Card>

        {(['admin', 'owner'].includes(user?.role || '')) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blacklist Rules</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats.blacklistRules}</div>
              )}
              <p className="text-xs text-muted-foreground">
                กฎทั้งหมด
              </p>
            </CardContent>
          </Card>
        )}

        {user?.role === 'owner' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              )}
              <p className="text-xs text-muted-foreground">
                ผู้ใช้ทั้งหมด
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
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
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              ยังไม่มีกิจกรรม - จะแสดงหลังจากมีการทำงานในระบบ
            </p>
          ) : (
            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <Badge className={getActionBadgeColor(log.action)}>
                      {formatAction(log.action)}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">
                        {log.actor.name || log.actor.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.target_type} {log.target_id && `(${log.target_id})`}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleString('th-TH')}
                  </div>
                </div>
              ))}
            </div>
          )}
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

        {(['admin', 'owner'].includes(user?.role || '')) && (
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

        {user?.role === 'owner' && (
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
