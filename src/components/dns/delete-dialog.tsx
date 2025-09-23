'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';

interface DNSRecord {
  id: string;
  type: string;
  name: string;
  content: string;
}

interface DeleteDialogProps {
  record: DNSRecord | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteDialog({ record, open, onClose, onConfirm }: DeleteDialogProps) {
  const { t } = useTranslation();

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการลบ DNS Record</DialogTitle>
          <DialogDescription>
            คุณแน่ใจหรือไม่ที่จะลบบันทึก DNS นี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Type:</span>
              <Badge variant="outline">{record.type}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Name:</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                {record.name}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Content:</span>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                {record.content}
              </code>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            ลบ DNS Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
