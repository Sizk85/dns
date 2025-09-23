'use client';

import { useState, useEffect } from 'react';
import { BlacklistTable } from '@/components/blacklist/blacklist-table';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface BlacklistRule {
  id: number;
  field: 'name' | 'content' | 'both';
  pattern: string;
  is_regex: boolean;
  type: string;
  description: string | null;
  created_by: number;
  created_at: string;
}

export default function BlacklistPage() {
  const { t } = useTranslation();
  const [rules, setRules] = useState<BlacklistRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blacklist');
      const result = await response.json();

      if (!result.ok) {
        toast.error(t(`err.${result.error?.code}`) || result.error?.message || 'Failed to fetch blacklist');
        return;
      }

      setRules(result.data.items || []);
    } catch (error) {
      toast.error(t('err.server_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Blacklist Management</h2>
        <p className="mt-1 text-sm text-gray-600">
          จัดการกฎการบล็อกสำหรับป้องกันการสร้าง DNS Records ที่ไม่พึงประสงค์
        </p>
      </div>

      <BlacklistTable
        rules={rules}
        loading={loading}
        onRefresh={fetchRules}
      />
    </div>
  );
}
