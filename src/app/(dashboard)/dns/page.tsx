'use client';

import { useState, useEffect } from 'react';
import { RecordTable } from '@/components/dns/record-table';
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
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">DNS Records</h2>
        <p className="mt-1 text-sm text-gray-600">
          จัดการบันทึก DNS ของโดเมนใน Cloudflare
        </p>
      </div>

      <RecordTable
        records={records}
        loading={loading}
        userRole={user?.role || 'user'}
        onRefresh={fetchRecords}
      />
    </div>
  );
}
