'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { createBlacklistSchema, type CreateBlacklistInput } from '@/lib/validation/blacklist';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface BlacklistRule {
  id: number;
  field: 'name' | 'content' | 'both';
  pattern: string;
  is_regex: boolean;
  type: string;
  description: string | null;
}

interface BlacklistFormProps {
  rule?: BlacklistRule | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultValues: CreateBlacklistInput = {
  field: 'name',
  pattern: '',
  is_regex: false,
  type: 'ANY',
  description: '',
};

export function BlacklistForm({ rule, open, onClose, onSuccess }: BlacklistFormProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isEditing = !!rule;

  const form = useForm({
    resolver: zodResolver(createBlacklistSchema),
    defaultValues,
  });

  const isRegex = form.watch('is_regex');

  useEffect(() => {
    if (rule) {
      form.reset({
        field: rule.field,
        pattern: rule.pattern,
        is_regex: rule.is_regex,
        type: rule.type as any,
        description: rule.description || '',
      });
    } else {
      form.reset(defaultValues);
    }
  }, [rule, form]);

  const onSubmit = async (data: any) => {
    setLoading(true);

    try {
      const url = isEditing 
        ? `/api/blacklist/${rule.id}`
        : '/api/blacklist';
      
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.ok) {
        toast.error(t(`err.${result.error?.code}`) || result.error?.message || 'Operation failed');
        return;
      }

      toast.success(isEditing ? t('blacklist.updated') : t('blacklist.created'));
      onSuccess();
    } catch (error) {
      toast.error(t('err.server_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      form.reset(defaultValues);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'แก้ไข' : 'เพิ่ม'}กฎ Blacklist
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="field"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('blacklist.field')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="name">Name (ชื่อ DNS)</SelectItem>
                      <SelectItem value="content">Content (ค่า DNS)</SelectItem>
                      <SelectItem value="both">Both (ทั้งคู่)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('blacklist.type')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ANY">ANY (ทุกชนิด)</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="AAAA">AAAA</SelectItem>
                      <SelectItem value="CNAME">CNAME</SelectItem>
                      <SelectItem value="MX">MX</SelectItem>
                      <SelectItem value="TXT">TXT</SelectItem>
                      <SelectItem value="SRV">SRV</SelectItem>
                      <SelectItem value="NS">NS</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_regex"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Regular Expression</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    ใช้ regex แทน glob pattern (* ?)
                  </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={loading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('blacklist.pattern')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        isRegex 
                          ? '^(test|staging)\\.' 
                          : 'test*, staging*'
                      }
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <div className="text-sm text-muted-foreground">
                    {isRegex 
                      ? 'ใช้ JavaScript RegExp pattern (เช่น ^(test|staging)\\.)' 
                      : 'ใช้ glob pattern (* = anything, ? = single char)'}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('blacklist.description')} (ไม่บังคับ)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="อธิบายจุดประสงค์ของกฎนี้..."
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'กำลังบันทึก...' : (isEditing ? 'อัปเดต' : 'สร้าง')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
