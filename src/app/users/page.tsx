'use client';

import { useState, useEffect } from 'react';
import { UserTable } from '@/components/users/user-table';
import { PageWrapper } from '@/components/page-wrapper';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface User {
  id: number;
  email: string;
  name: string | null;
  role: 'user' | 'admin' | 'owner';
  is_active: boolean;
  created_at: string;
}

interface CurrentUser {
  id: number;
  email: string;
  role: 'user' | 'admin' | 'owner';
  name: string | null;
}

export default function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const result = await response.json();

      if (!result.ok) {
        toast.error(t(`err.${result.error?.code}`) || result.error?.message || 'Failed to fetch users');
        return;
      }

      setUsers(result.data.items || []);
    } catch (error) {
      toast.error(t('err.server_error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const result = await response.json();

      if (result.ok) {
        setCurrentUser(result.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  return (
    <PageWrapper 
      currentPage="users" 
      title="User Management" 
      description="จัดการผู้ใช้งานและบทบาทในระบบ (เฉพาะ Owner)"
    >
      <UserTable
        users={users}
        loading={loading}
        currentUserId={currentUser?.id || 0}
        onRefresh={fetchUsers}
      />
    </PageWrapper>
  );
}
