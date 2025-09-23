# Security Checklist
- ✅ Hash password ด้วย bcrypt/argon2
- ✅ Session token httpOnly + secure (prod)
- ✅ Rate limit login/register/dns mutations
- ✅ Validate + sanitize ทุก input (Zod)
- ✅ RBAC เช็กที่ server ทุกครั้ง
- ✅ ไม่ log secrets
- ✅ แยก error user-facing vs internal
- ✅ Headers: `Content-Security-Policy` (อย่างน้อย default-src 'self')
