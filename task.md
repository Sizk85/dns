# Tasks & Execution Plan (สำหรับ Cursor)

## Phase 0 — Project Init
- [ ] สร้าง Next.js 14 + TS + Tailwind + shadcn + Drizzle + ESLint + Prettier
- [ ] ตั้งค่า `drizzle.config.ts` + สร้างตารางตาม `db/schema.ts`
- [ ] ตั้งค่า i18n helper + ใส่ `i18n/*.json`

## Phase 1 — Auth
- [ ] Register API + hash password + create user (role=user)
- [ ] Login API + issue session token (DB + cookie)
- [ ] Middleware บังคับ login สำหรับเส้นทางใน `(dashboard)`
- [ ] หน้า login/register พร้อมฟอร์ม + toast

## Phase 2 — DNS Records
- [ ] สร้าง `lib/cloudflare.ts` (list/create/update/delete)
- [ ] GET `/api/dns/records` + UI ตาราง + filter + empty/loading states
- [ ] POST `/api/dns/records` + Zod validate ต่อ type + blacklist check + audit log
- [ ] PATCH `/api/dns/records/:id` + partial update + audit log
- [ ] DELETE `/api/dns/records/:id` (admin+) + audit log

## Phase 3 — Blacklist (admin+)
- [ ] ตาราง blacklist + CRUD API + UI
- [ ] `lib/blacklist.ts` รองรับ glob (`*`, `?`) และ regex (ถ้า `is_regex=true`)
- [ ] ผูกกับ create/update DNS

## Phase 4 — Users (owner)
- [ ] GET users list (owner)
- [ ] PATCH role (owner) + log
- [ ] PATCH deactivate (owner) + log

## Phase 5 — UX Polish & QA
- [ ] Loading/Empty/Error/Success ครบถ้วน
- [ ] Toast/i18n ครบ
- [ ] Audit log แสดงใน Dashboard ล่าสุด 5 รายการ
- [ ] Tests หลักผ่าน
