# RBAC Policy

Roles: user, admin, owner

| Feature | user | admin | owner |
|---|---|---|---|
| Login/Register | ✅ | ✅ | ✅ |
| View DNS records | ✅ | ✅ | ✅ |
| Create DNS records | ⚠️ (เปิด/ปิดได้ตามนโยบาย) | ✅ | ✅ |
| Edit DNS records | ⚠️ (เฉพาะบาง type หรือเฉพาะ subdomain ของตน) | ✅ | ✅ |
| Delete DNS records | ❌ (ค่าเริ่มต้น) | ✅ | ✅ |
| Blacklist (CRUD) | ❌ | ✅ | ✅ |
| View users | ❌ | ❌ | ✅ |
| Change user role | ❌ | ❌ | ✅ |
| Deactivate user | ❌ | ❌ | ✅ |

Notes:
- Owner มีสิทธิ์เท่า admin + จัดการผู้ใช้
- ทุก action ที่เป็น mutation → audit log
- บังคับใช้ที่ server-side เสมอ (UI gating เป็นเสริม)
