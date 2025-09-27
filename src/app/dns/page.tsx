'use client';

import { useState, useEffect } from 'react';
import { RecordTable } from '@/components/dns/record-table';
import { PageWrapper } from '@/components/page-wrapper';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface DNSRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
  created_on: string;
  modified_on: string;
}

interface User {
  id: number;
  email: string;
  role: 'user' | 'admin' | 'owner';
  name: string | null;
}

export default function DNSPage() {
  const { t } = useTranslation();
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dns/records');
      const result = await response.json();

      if (!result.ok) {
        toast.error(t(`err.${result.error?.code}`) || result.error?.message || 'Failed to fetch records');
        return;
      }

      setRecords(result.data.items || []);
    } catch (error) {
      toast.error(t('err.server_error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const result = await response.json();

      if (result.ok) {
        setUser(result.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user session:', error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchRecords();
  }, []);

  return (
    <PageWrapper 
      currentPage="dns" 
      title="DNS Records" 
      description="จัดการบันทึก DNS ของโดเมนใน Cloudflare"
    >
      <RecordTable
        records={records}
        loading={loading}
        userRole={user?.role || 'user'}
        onRefresh={fetchRecords}
      />
    </PageWrapper>
  );
}
