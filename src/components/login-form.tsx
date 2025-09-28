'use client';

import { useState } from 'react';

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);   // 🟢 toggle login/register
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    if (isRegister) {
      const confirm = (document.getElementById('confirmPassword') as HTMLInputElement).value;
      if (password !== confirm) {
        setError('รหัสผ่านไม่ตรงกัน');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(isRegister ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (result.ok) {
        alert(isRegister ? 'สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ' : 'เข้าสู่ระบบสำเร็จ!');
        if (isRegister) {
          setIsRegister(false); // สมัครแล้วกลับไปหน้า login
        } else {
          window.location.href = '/dns';
        }
      } else {
        setError(result.error?.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">
        {isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">อีเมล</label>
          <input
            type="email"
            id="email"
            disabled={loading}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
          <input
            type="password"
            id="password"
            disabled={loading}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        {isRegister && (
          <div>
            <label className="block text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
            <input
              type="password"
              id="confirmPassword"
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {loading ? (isRegister ? 'กำลังสมัครสมาชิก...' : 'กำลังเข้าสู่ระบบ...') : (isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ')}
        </button>

        <p className="text-center text-sm text-gray-600">
          {isRegister ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'}{' '}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 hover:underline"
          >
            {isRegister ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </button>
        </p>
      </div>
    </div>
  );
}
