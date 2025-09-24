# Operations (Dev & Deploy)

## Local Dev
- รัน Postgres (เช่น Docker): `docker run --name pg -e POSTGRES_PASSWORD=pass -p 5432:5432 -d postgres:16`
- ตั้งค่า `.env`
- `pnpm install`
- `pnpm drizzle-kit generate && pnpm drizzle-kit push`
- `pnpm dev`

## Deploy

### Docker (Coolify/Railway/Render)
- Repository: https://github.com/Sizk85/dns.git
- Build: Docker (ใช้ Dockerfile ที่มีอยู่)
- Port: 3000
- Environment variables ตาม `env.example`

### Manual Deploy
- Build command: `npm run build`
- Start: `npm start`
- Port: 3000

## Notes
- หากมีแต่ `CF_ZONE_NAME` ให้ทำ lookup `zone_id` หนึ่งครั้งตอนบูต แล้ว cache ใน memory
- จัดการ 401/403 ที่ middleware ด้วย redirect ไป `/login`
