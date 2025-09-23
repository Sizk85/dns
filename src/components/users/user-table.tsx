'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, UserX, Settings } from 'lucide-react';
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

interface UserTableProps {
  users: User[];
  loading: boolean;
  currentUserId: number;
  onRefresh: () => void;
}

export function UserTable({ users, loading, currentUserId, onRefresh }: UserTableProps) {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'role' | 'deactivate' | null>(null);
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [processing, setProcessing] = useState(false);

  const handleRoleChange = async (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role as 'user' | 'admin');
    setActionType('role');
  };

  const handleDeactivate = async (user: User) => {
    setSelectedUser(user);
    setActionType('deactivate');
  };

  const executeAction = async () => {
    if (!selectedUser || !actionType) return;

    setProcessing(true);
    try {
      let url: string;
      let body: any;

      if (actionType === 'role') {
        url = `/api/users/${selectedUser.id}/role`;
        body = { role: newRole };
      } else {
        url = `/api/users/${selectedUser.id}/deactivate`;
        body = { is_active: !selectedUser.is_active };
      }

      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!result.ok) {
        toast.error(t(`err.${result.error?.code}`) || result.error?.message || 'Operation failed');
        return;
      }

      toast.success(
        actionType === 'role' 
          ? 'เปลี่ยนบทบาทสำเร็จ'
          : selectedUser.is_active ? 'ปิดการใช้งานสำเร็จ' : 'เปิดการใช้งานสำเร็จ'
      );
      
      setSelectedUser(null);
      setActionType(null);
      onRefresh();
    } catch (error) {
      toast.error(t('err.server_error'));
    } finally {
      setProcessing(false);
    }
  };

  const closeDialog = () => {
    if (!processing) {
      setSelectedUser(null);
      setActionType(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('users.title')}</CardTitle>
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
          <div>
            <CardTitle>{t('users.title')}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              จัดการผู้ใช้งานและบทบาทในระบบ
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">ไม่มีผู้ใช้ในระบบ</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('users.email')}</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>{t('users.role')}</TableHead>
                  <TableHead>{t('users.status')}</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.email}
                      {user.id === currentUserId && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          คุณ
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.name || '-'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          user.role === 'owner' ? 'default' :
                          user.role === 'admin' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <Badge className="bg-green-100 text-green-800">
                          {t('users.active')}
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          {t('users.inactive')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('th-TH')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* Can't manage yourself or other owners */}
                        {user.id !== currentUserId && user.role !== 'owner' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRoleChange(user)}
                              title="เปลี่ยนบทบาท"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeactivate(user)}
                              title={user.is_active ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}
                            >
                              {user.is_active ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={actionType === 'role'} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เปลี่ยนบทบาทผู้ใช้</DialogTitle>
            <DialogDescription>
              เปลี่ยนบทบาทของ {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium">บทบาทใหม่:</label>
            <Select value={newRole} onValueChange={(value: 'user' | 'admin') => setNewRole(value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={processing}>
              ยกเลิก
            </Button>
            <Button onClick={executeAction} disabled={processing}>
              {processing ? 'กำลังเปลี่ยน...' : 'เปลี่ยนบทบาท'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={actionType === 'deactivate'} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.is_active ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}ผู้ใช้
            </DialogTitle>
            <DialogDescription>
              คุณแน่ใจหรือไม่ที่จะ{selectedUser?.is_active ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'} {selectedUser?.email}?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm">
                <strong>ผู้ใช้:</strong> {selectedUser?.email}
              </div>
              <div className="text-sm mt-1">
                <strong>บทบาท:</strong> {selectedUser?.role}
              </div>
              <div className="text-sm mt-1">
                <strong>สถานะปัจจุบัน:</strong> {selectedUser?.is_active ? 'ใช้งาน' : 'ปิดการใช้งาน'}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={processing}>
              ยกเลิก
            </Button>
            <Button 
              variant={selectedUser?.is_active ? 'destructive' : 'default'}
              onClick={executeAction} 
              disabled={processing}
            >
              {processing ? 'กำลังดำเนินการ...' : 
               selectedUser?.is_active ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
