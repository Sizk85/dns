# Cloudflare DNS Manager

ระบบเว็บจัดการ DNS ผ่าน Cloudflare พร้อม Authentication, Role-Based Access Control และฟีเจอร์ความปลอดภัย

## Features

✅ **Authentication & Authorization**
- Register/Login/Logout พร้อม session management
- Role-Based Access Control (user/admin/owner)
- JWT + secure cookies

✅ **DNS Management**
- View, Create, Edit, Delete DNS records
- รองรับ A, AAAA, CNAME, MX, TXT, SRV, NS
- Cloudflare API integration

✅ **Blacklist System**
- Pattern matching (glob/regex)
- ป้องกัน DNS records ที่ไม่พึงประสงค์
- Admin/Owner only

✅ **User Management**
- Owner จัดการ users และ roles
- Activate/Deactivate users

✅ **Audit Logging**
- บันทึกการกระทำทั้งหมด
- แสดงใน Dashboard

✅ **Internationalization**
- รองรับภาษาไทย/อังกฤษ

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: TailwindCSS + shadcn/ui
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Custom JWT + bcrypt
- **API**: Cloudflare API v4

## Quick Start

### 1. Setup Database

```bash
# Start PostgreSQL (Docker)
docker run --name pg -e POSTGRES_PASSWORD=pass -p 5432:5432 -d postgres:16

# Create database
docker exec -it pg psql -U postgres -c "CREATE DATABASE dns_manager;"
```

### 2. Environment Setup

Copy `env.example` to `.env.local`:

```bash
cp env.example .env.local
```

Edit `.env.local`:

```env
# Cloudflare
CF_API_TOKEN=your_cloudflare_api_token_here
CF_ZONE_NAME=your-domain.com

# Database
DATABASE_URL=postgres://postgres:pass@localhost:5432/dns_manager

# Auth
AUTH_SECRET=your_very_long_random_secret_string_here_at_least_32_characters
APP_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Install & Run

```bash
# Install dependencies
npm install

# Database migration
npm run db:generate
npm run db:push

# Create owner user
npm run db:seed

# Start development server
npm run dev
```

### 4. Login

- URL: http://localhost:3000
- Default owner: `owner@example.com` / `ChangeMe123!`

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login/Register pages
│   ├── (dashboard)/      # Main app pages
│   └── api/             # API routes
├── components/          # UI components
├── db/                  # Database schema & client
├── lib/                 # Utilities & helpers
└── styles/              # Global styles
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - สมัครสมาชิก
- `POST /api/auth/login` - เข้าสู่ระบบ
- `GET /api/auth/session` - ตรวจสอบ session
- `POST /api/auth/logout` - ออกจากระบบ

### DNS Records
- `GET /api/dns/records` - ดูรายการ DNS
- `POST /api/dns/records` - สร้าง DNS record
- `PATCH /api/dns/records/[id]` - แก้ไข DNS record
- `DELETE /api/dns/records/[id]` - ลบ DNS record

### Blacklist (Admin+)
- `GET /api/blacklist` - ดูรายการ blacklist
- `POST /api/blacklist` - สร้างกฎ blacklist
- `PATCH /api/blacklist/[id]` - แก้ไขกฎ blacklist
- `DELETE /api/blacklist/[id]` - ลบกฎ blacklist

### Users (Owner Only)
- `GET /api/users` - ดูรายการผู้ใช้
- `PATCH /api/users/[id]/role` - เปลี่ยนบทบาท
- `PATCH /api/users/[id]/deactivate` - เปิด/ปิดการใช้งาน

### Audit Logs
- `GET /api/audit` - ดู audit logs

## Permissions

| Feature | User | Admin | Owner |
|---------|------|-------|-------|
| View DNS | ✅ | ✅ | ✅ |
| Create DNS | ✅ | ✅ | ✅ |
| Edit DNS | ⚠️ | ✅ | ✅ |
| Delete DNS | ❌ | ✅ | ✅ |
| Blacklist | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ✅ |

## Security Features

- Password hashing (bcrypt)
- Secure JWT sessions
- RBAC enforcement
- Input validation (Zod)
- Audit logging
- Blacklist protection

## Development

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Database operations
npm run db:generate  # Generate migrations
npm run db:push      # Push to database
npm run db:seed      # Seed owner user

# Build
npm run build
npm start
```

## Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Seed owner user
5. Deploy with `npm run build && npm start`

Supports deployment on Vercel, Railway, Render, Coolify, etc.

## License

MIT
