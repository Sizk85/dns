# Requirements Document — Cloudflare DNS Manager

## Introduction
ระบบเว็บจัดการ DNS ผ่าน Cloudflare พร้อม Authentication, Role-Based Access Control (RBAC: user/admin/owner), ระบบจัดการผู้ใช้ (เฉพาะ owner), ฟีเจอร์ blacklist และ UI หลายภาษา (TH/EN) ใช้ Cloudflare API โดยกำหนดค่า API/Zone ผ่าน environment variables

## Requirement 1: View DNS Records
- แสดงรายการ DNS ทั้งหมดของ zone ที่กำหนด
- แสดง type, name, content, TTL, proxy status
- จัดการ error จาก API ด้วยข้อความที่เข้าใจง่าย
- ถ้าไม่มีข้อมูล แสดง empty state

## Requirement 2: Create DNS Records
- ปุ่ม "Add Record" เปิดฟอร์ม (type, name, content, TTL, proxied)
- ส่งข้อมูลถูกต้อง → เรียก Cloudflare API สร้าง record + รีเฟรชรายการ
- ข้อมูลไม่ถูกต้อง → แสดง validation error
- API error ระหว่างสร้าง → แสดงข้อความ error
- รองรับชนิด A, AAAA, CNAME, MX, TXT, SRV, NS

## Requirement 3: Edit DNS Records
- ปุ่ม "Edit" เปิดฟอร์มพร้อมค่าปัจจุบัน (pre-filled)
- บันทึกสำเร็จ → เรียก API อัปเดตเฉพาะฟิลด์ที่เปลี่ยน + รีเฟรช
- ข้อมูลไม่ถูกต้อง → แสดง validation error
- API error ระหว่างอัปเดต → แสดงข้อความ error
- ต้องคง record ID

## Requirement 4: Delete DNS Records
- มี Dialog ยืนยันก่อนลบ
- ยืนยัน → เรียก API ลบ + รีเฟรช
- ยกเลิก → ปิด Dialog ไม่มีการเปลี่ยนแปลง
- API error ระหว่างลบ → แสดงข้อความ error
- แจ้งผลสำเร็จ/ไม่สำเร็จชัดเจน

## Requirement 5: Env Config
- ตอนเริ่มระบบ อ่าน CF_API_TOKEN จาก env
- ตอนเริ่มระบบ อ่าน Zone (CF_ZONE_ID หรือ CF_ZONE_NAME) จาก env
- ขาด env ที่จำเป็น → บล็อกการทำงาน DNS พร้อม error ชัดเจน
- Token ไม่ถูกต้อง → แสดง auth error
- Zone ไม่ถูกต้อง/เข้าไม่ถึง → แสดง error

## Requirement 6: Auth (Register/Login/Session)
- สมัครด้วย email + password (hash)
- ผู้ใช้ใหม่เริ่มต้น role = user
- Login ถูกต้อง → เข้าใช้งานได้
- Login ผิด → แสดง error
- Session ปลอดภัย (JWT + cookie secure)
- Logout → เคลียร์ session และกลับหน้า login

## Requirement 7: User Management (Owner Only)
- Owner เห็นผู้ใช้ทั้งหมด
- Owner เปลี่ยน role user <-> admin ได้ + บันทึก log
- Owner deactivate ผู้ใช้ได้ (is_active=false)
- สิทธิ์ใหม่มีผลเมื่อ login ครั้งต่อไปหรือ refresh session

## Requirement 8: Admin Permissions
- Admin: จัดการ DNS ได้เต็มที่
- User: สิทธิ์จำกัด (ดู + (ตัวเลือก) สร้าง/แก้/ลบเฉพาะที่นโยบายอนุญาต)
- พยายามเกินสิทธิ์ → ปฏิเสธพร้อมข้อความ
- UI แสดง/ซ่อนตาม role
- การกระทำสำคัญของ admin ต้องมี audit log

## Requirement 9: Blacklist
- Admin จัดการรายการ blacklist patterns ได้
- ถ้า record ใหม่/แก้ไข match blacklist → บล็อก + แสดงเหตุผล
- ลบ blacklist → ไม่บล็อกอีก
- รองรับ pattern matching ทั้งชื่อและเนื้อหา (glob/regex)

## Requirement 10: UX
- Responsive ทุกหน้าจอ
- Loading indicators ระหว่าง API call
- Success feedback ชัดเจน
- Error messages เป็นมิตร
- โทน UI คล้าย Cloudflare Dashboard