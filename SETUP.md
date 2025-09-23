# Setup Instructions - Cloudflare DNS Manager

## 🚨 **ขั้นตอนสำคัญก่อนใช้งาน**

### 1. สร้าง Database

**Option A: Docker (แนะนำ)**
```bash
docker run --name dns-postgres -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=dns_manager -p 5432:5432 -d postgres:16
```

**Option B: Local PostgreSQL**
- ติดตั้ง PostgreSQL
- สร้าง database `dns_manager`

### 2. สร้าง .env.local

**สร้างไฟล์ `.env.local` ที่ root ของโปรเจกต์:**

```env
# Cloudflare API (จำเป็น)
CF_API_TOKEN=your_cloudflare_api_token_here
CF_ZONE_NAME=yourdomain.com

# Database (แก้ไขตาม setup ของคุณ)
DATABASE_URL=postgres://postgres:mypassword@localhost:5432/dns_manager

# Auth Secret (สร้าง random string ยาวๆ)
AUTH_SECRET=your_very_long_random_secret_string_here_at_least_32_characters_long_for_security

# App Config
APP_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### 3. วิธีได้ Cloudflare API Token

1. เข้า https://dash.cloudflare.com/profile/api-tokens
2. คลิก "Create Token"
3. ใช้ template "Edit zone DNS" 
4. เลือก Zone ที่ต้องการ
5. Copy token ที่ได้

### 4. Database Migration & Seed

```bash
# Generate และ push database schema
npm run db:generate
npm run db:push

# สร้าง owner user แรก
npm run db:seed
```

### 5. เริ่มใช้งาน

```bash
npm run dev
```

**เข้าใช้งาน:**
- URL: http://localhost:3000
- Owner login: `owner@example.com` / `ChangeMe123!`

### 🔧 **Troubleshooting**

**Database Connection Error:**
- ตรวจสอบ PostgreSQL running
- ตรวจสอบ `DATABASE_URL` ใน `.env.local`
- ตรวจสอบ database `dns_manager` ถูกสร้างแล้ว

**Cloudflare API Error:**
- ตรวจสอบ `CF_API_TOKEN` ถูกต้อง
- ตรวจสอบ `CF_ZONE_NAME` ตรงกับโดเมนใน Cloudflare
- ตรวจสอบ token มีสิทธิ์ Edit DNS

**Build Error:**
- ลบ `.next` folder: `Remove-Item -Recurse -Force .next`
- Build ใหม่: `npm run build`

### 📁 **โครงสร้างโปรเจกต์**

```
✅ Authentication System (/login, /register)
✅ Dashboard (/) 
✅ DNS Management (/dns)
✅ Blacklist Management (/blacklist) - Admin+
✅ User Management (/users) - Owner only
✅ API Routes (/api/*)
✅ Audit Logging
✅ RBAC Protection
✅ i18n Support (TH/EN)
```

**โปรเจกต์พร้อมใช้งานเมื่อตั้งค่า environment แล้ว!** 🎯
