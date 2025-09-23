'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { BlacklistForm } from './blacklist-form';
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

interface BlacklistTableProps {
  rules: BlacklistRule[];
  loading: boolean;
  onRefresh: () => void;
}

export function BlacklistTable({ rules, loading, onRefresh }: BlacklistTableProps) {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRule, setEditingRule] = useState<BlacklistRule | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (ruleId: number) => {
    try {
      setDeletingId(ruleId);
      const response = await fetch(`/api/blacklist/${ruleId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.ok) {
        toast.error(t(`err.${result.error?.code}`) || result.error?.message || 'Delete failed');
        return;
      }

      toast.success(t('blacklist.deleted'));
      onRefresh();
    } catch (error) {
      toast.error(t('err.server_error'));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('blacklist.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('blacklist.title')}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                กฎการบล็อกสำหรับป้องกันการสร้าง DNS Records ที่ไม่พึงประสงค์
              </p>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มกฎ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                ยังไม่มีกฎ Blacklist
              </div>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มกฎแรก
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('blacklist.field')}</TableHead>
                  <TableHead>{t('blacklist.pattern')}</TableHead>
                  <TableHead>{t('blacklist.type')}</TableHead>
                  <TableHead>{t('blacklist.is_regex')}</TableHead>
                  <TableHead>{t('blacklist.description')}</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Badge variant="outline">{rule.field}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm max-w-xs">
                      <div className="truncate" title={rule.pattern}>
                        {rule.pattern}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.type === 'ANY' ? 'default' : 'secondary'}>
                        {rule.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {rule.is_regex ? (
                        <Badge className="bg-blue-100 text-blue-800">Regex</Badge>
                      ) : (
                        <Badge variant="outline">Glob</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={rule.description || ''}>
                        {rule.description || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingRule(rule)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(rule.id)}
                          disabled={deletingId === rule.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      <BlacklistForm
        rule={editingRule}
        open={showAddForm || !!editingRule}
        onClose={() => {
          setShowAddForm(false);
          setEditingRule(null);
        }}
        onSuccess={() => {
          setShowAddForm(false);
          setEditingRule(null);
          onRefresh();
        }}
      />
    </>
  );
}
