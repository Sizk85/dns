# Tech Stack & Decisions

- **Framework**: Next.js 14 (App Router), TypeScript
- **UI**: TailwindCSS + shadcn/ui, lucide-react icons
- **Forms**: React Hook Form + @hookform/resolvers + Zod
- **Auth**: NextAuth (Credentials Provider) + Drizzle Adapter (custom) หรือ custom minimal auth (เลือกหนึ่ง; เริ่มด้วย Credentials + own tables)
- **DB**: PostgreSQL (Drizzle ORM)
- **i18n**: ไฟล์ `i18n/en.json`, `i18n/th.json` + helper `t(key)` ใน `/lib/i18n`
- **Logging**: pino (server), console (client minimal)
- **State**: RSC + server actions + SWR สำหรับ refresh list (optional)
- **CF API**: REST v4 — ใช้ fetch wrapper `/lib/cloudflare.ts`

## Packages (หลัก)
- next, react, react-dom, typescript
- tailwindcss, class-variance-authority, tailwind-merge
- @radix-ui + shadcn/ui
- zod, react-hook-form, @hookform/resolvers
- drizzle-orm, drizzle-kit, pg
- bcrypt (หรือ argon2)
- jsonwebtoken (ถ้าใช้ JWT เอง)
- pino
- sonner (toast)

## Environment Variables
- `CF_API_TOKEN` — Cloudflare API Token (DNS edit perms)
- `CF_ZONE_ID` — Zone ID (ถ้าไม่ใส่ ให้ใช้ `CF_ZONE_NAME` เพื่อ lookup ครั้งเดียวตอนบูต)
- `CF_ZONE_NAME` — ชื่อ zone เช่น `example.com` (ตัวเลือก)
- `DATABASE_URL` — Postgres connection string
- `AUTH_SECRET` — secret สำหรับ JWT/session
- `APP_BASE_URL` — e.g. `https://dns.example.com`
- `NODE_ENV` — `development` | `production`

## Error Handling แนวทาง
- Map error จาก CF API → โครงสร้าง `{ code, message, hint? }`
- แยกโดเมน error: network, auth, validation, forbidden, not found
- ทุก API route return JSON มาตรฐาน `{ ok: boolean, data?: T, error?: { code, message } }`