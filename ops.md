# Operations (Dev & Deploy)

## Local Dev
- รัน Postgres (เช่น Docker): `docker run --name pg -e POSTGRES_PASSWORD=pass -p 5432:5432 -d postgres:16`
- ตั้งค่า `.env`
- `pnpm install`
- `pnpm drizzle-kit generate && pnpm drizzle-kit push`
- `pnpm dev`

## Deploy (ตัวอย่าง Coolify)
- ตั้ง env ตาม `env.example`
- Build command: `pnpm build`
- Start: `pnpm start`

## Notes
- หากมีแต่ `CF_ZONE_NAME` ให้ทำ lookup `zone_id` หนึ่งครั้งตอนบูต แล้ว cache ใน memory
- จัดการ 401/403 ที่ middleware ด้วย redirect ไป `/login`
