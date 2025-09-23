'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { DeleteDialog } from './delete-dialog';
import { RecordForm } from './record-form';
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

interface RecordTableProps {
  records: DNSRecord[];
  loading: boolean;
  userRole: 'user' | 'admin' | 'owner';
  onRefresh: () => void;
}

export function RecordTable({ records, loading, userRole, onRefresh }: RecordTableProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DNSRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<DNSRecord | null>(null);

  const canCreate = userRole === 'admin' || userRole === 'owner';
  const canEdit = userRole === 'admin' || userRole === 'owner';
  const canDelete = userRole === 'admin' || userRole === 'owner';

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (recordId: string) => {
    try {
      const response = await fetch(`/api/dns/records/${recordId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.ok) {
        toast.error(t(`err.${result.error?.code}`) || result.error?.message || 'Delete failed');
        return;
      }

      toast.success(t('dns.deleted'));
      setDeletingRecord(null);
      onRefresh();
    } catch (error) {
      toast.error(t('err.server_error'));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>DNS Records</CardTitle>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
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
            <CardTitle>DNS Records</CardTitle>
            {canCreate && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('dns.add')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="ค้นหาชื่อหรือค่า DNS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="AAAA">AAAA</SelectItem>
                <SelectItem value="CNAME">CNAME</SelectItem>
                <SelectItem value="MX">MX</SelectItem>
                <SelectItem value="TXT">TXT</SelectItem>
                <SelectItem value="SRV">SRV</SelectItem>
                <SelectItem value="NS">NS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {searchTerm || typeFilter !== 'all' 
                  ? 'ไม่พบบันทึกที่ตรงกับเงื่อนไขการค้นหา'
                  : t('dns.empty')
                }
              </div>
              {canCreate && !searchTerm && typeFilter === 'all' && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('dns.add')}
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('dns.type')}</TableHead>
                  <TableHead>{t('dns.name')}</TableHead>
                  <TableHead>{t('dns.content')}</TableHead>
                  <TableHead>TTL</TableHead>
                  <TableHead>{t('dns.proxied')}</TableHead>
                  <TableHead>Modified</TableHead>
                  {(canEdit || canDelete) && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Badge variant="outline">{record.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{record.name}</TableCell>
                    <TableCell className="font-mono text-sm max-w-xs truncate">
                      {record.content}
                    </TableCell>
                    <TableCell>{record.ttl === 1 ? 'Auto' : record.ttl}</TableCell>
                    <TableCell>
                      {record.proxied ? (
                        <Badge className="bg-orange-100 text-orange-800">Proxied</Badge>
                      ) : (
                        <Badge variant="outline">DNS Only</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(record.modified_on).toLocaleDateString('th-TH')}
                    </TableCell>
                    {(canEdit || canDelete) && (
                      <TableCell>
                        <div className="flex gap-2">
                          {canEdit && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingRecord(record)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeletingRecord(record)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Form Dialog */}
      <RecordForm
        record={editingRecord}
        open={showAddForm || !!editingRecord}
        onClose={() => {
          setShowAddForm(false);
          setEditingRecord(null);
        }}
        onSuccess={() => {
          setShowAddForm(false);
          setEditingRecord(null);
          onRefresh();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        record={deletingRecord}
        open={!!deletingRecord}
        onClose={() => setDeletingRecord(null)}
        onConfirm={() => deletingRecord && handleDelete(deletingRecord.id)}
      />
    </>
  );
}
