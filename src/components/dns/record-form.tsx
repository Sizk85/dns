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
import { AnyRecord, type DNSRecordInput } from '@/lib/validation/dns';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface DNSRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
  priority?: number;
}

interface RecordFormProps {
  record?: DNSRecord | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultValues: Partial<DNSRecordInput> = {
  type: 'A',
  name: '',
  content: '',
  ttl: 1,
  proxied: false,
};

export function RecordForm({ record, open, onClose, onSuccess }: RecordFormProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isEditing = !!record;

  const form = useForm<DNSRecordInput>({
    resolver: zodResolver(AnyRecord),
    defaultValues,
  });

  const selectedType = form.watch('type');

  useEffect(() => {
    if (record) {
      form.reset({
        type: record.type as any,
        name: record.name,
        content: record.content,
        ttl: record.ttl,
        proxied: record.proxied,
        priority: record.priority,
      });
    } else {
      form.reset(defaultValues);
    }
  }, [record, form]);

  const onSubmit = async (data: DNSRecordInput) => {
    setLoading(true);

    try {
      const url = isEditing 
        ? `/api/dns/records/${record.id}`
        : '/api/dns/records';
      
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

      toast.success(isEditing ? t('dns.updated') : t('dns.created'));
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
            {isEditing ? t('dns.edit') : t('dns.add')} DNS Record
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('dns.type')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loading || isEditing} // Don't allow type change when editing
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกชนิด DNS" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A">A (IPv4)</SelectItem>
                      <SelectItem value="AAAA">AAAA (IPv6)</SelectItem>
                      <SelectItem value="CNAME">CNAME</SelectItem>
                      <SelectItem value="MX">MX (Mail)</SelectItem>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('dns.name')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={selectedType === 'A' ? 'www' : 'ชื่อ subdomain'}
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('dns.content')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        selectedType === 'A' ? '192.168.1.1' :
                        selectedType === 'AAAA' ? '2001:db8::1' :
                        selectedType === 'CNAME' ? 'example.com' :
                        selectedType === 'MX' ? 'mail.example.com' :
                        selectedType === 'TXT' ? 'v=spf1 include:_spf.google.com ~all' :
                        'ค่า DNS'
                      }
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType === 'MX' && (
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10"
                        disabled={loading}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="ttl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>TTL (seconds)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                    disabled={loading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Auto</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                      <SelectItem value="600">10 minutes</SelectItem>
                      <SelectItem value="1800">30 minutes</SelectItem>
                      <SelectItem value="3600">1 hour</SelectItem>
                      <SelectItem value="7200">2 hours</SelectItem>
                      <SelectItem value="18000">5 hours</SelectItem>
                      <SelectItem value="43200">12 hours</SelectItem>
                      <SelectItem value="86400">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(selectedType === 'A' || selectedType === 'AAAA' || selectedType === 'CNAME') && (
              <FormField
                control={form.control}
                name="proxied"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{t('dns.proxied')}</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        ผ่าน Cloudflare Proxy (สีส้ม)
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
            )}

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
