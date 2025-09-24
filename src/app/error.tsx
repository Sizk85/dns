'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">เกิดข้อผิดพลาด</CardTitle>
            <CardDescription>
              ระบบพบปัญหาในการทำงาน กรุณาลองใหม่อีกครั้ง
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800 font-mono">
                  {error.message}
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Button onClick={reset} className="w-full">
                ลองใหม่
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/login'}
                className="w-full"
              >
                กลับไปหน้าเข้าสู่ระบบ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
