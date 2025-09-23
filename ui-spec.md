# UI Spec (shadcn/ui + Tailwind)

## Global
- Layout แบ่ง Sidebar (เมนูตาม role) + Header (โปรไฟล์/ภาษา/logout)
- ใช้ Breadcrumbs
- ทุกหน้า list มี: search, filter by type, pagination
- ใช้ Skeleton/Spinner ช่วงโหลด
- ใช้ Toast สำหรับ success/error

## Pages
1) Login/Register
- ฟอร์มอีเมล/รหัสผ่าน + validation + แสดงข้อผิดพลาดชัดเจน

2) Dashboard (overview)
- การ์ดสรุป: จำนวน records, ล่าสุดแก้ไข, จำนวน blacklist, audit ล่าสุด 5 รายการ

3) DNS / Records (list)
- ตารางคอลัมน์: Type | Name | Content | TTL | Proxied | Modified | Actions (Edit/Delete)
- ปุ่ม Add Record (dialog หรือหน้า /dns/new)
- Filter: by type, by proxied, keyword search (name/content)
- Empty state พร้อมปุ่ม Add

4) DNS / New & Edit
- ฟอร์ม dynamic ตาม type (เช่น SRV มี fields พิเศษ)
- Validate ด้วย Zod; แสดงข้อความตามภาษา
- Submit → call API → toast + redirect back

5) Blacklist (admin+)
- ตาราง: Field | Pattern | Type | is_regex | Description | Actions
- Add/Edit dialog + validate

6) Users (owner)
- ตาราง: Email | Role | Status | Created | Actions (Change role, Deactivate)
- Confirm dialog ก่อนเปลี่ยน role/deactivate

## i18n Keys ตัวอย่าง
- `nav.dns`, `nav.blacklist`, `nav.users`
- `dns.add`, `dns.edit`, `dns.delete`, `dns.type`, `dns.name`, `dns.content`, `dns.ttl`, `dns.proxied`
- `msg.saved`, `msg.deleted`, `err.validation`, `err.blacklist_blocked`
