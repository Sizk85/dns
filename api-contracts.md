# API Contracts (JSON over HTTP)

## Response Envelope
- Success: `{ "ok": true, "data": <T> }`
- Error: `{ "ok": false, "error": { "code": string, "message": string } }`

## Auth
### POST /api/auth/register
- Body: `{ email: string, password: string, name?: string }`
- 201 → data: `{ id, email, role }`
- Errors: `validation_error`, `conflict`, `server_error`

### POST /api/auth/login
- Body: `{ email: string, password: string }`
- 200 → data: `{ token, user: { id, email, role, name } }`
- Set-Cookie: session token (httpOnly)
- Errors: `invalid_credentials`, `rate_limited`

### GET /api/auth/session
- 200 → `{ user: { id, email, role, name }, expiresAt }`

## DNS Records
### GET /api/dns/records?type=&name=&page=&perPage=
- Role: user+
- 200 → `{ items: Record[], total }`
- Record: `{ id, type, name, content, ttl, proxied, created_on, modified_on }`

### POST /api/dns/records
- Role: user+ (อาจจำกัดเฉพาะ admin ถ้าต้องการ)
- Body: `{ type: 'A'|'AAAA'|'CNAME'|'MX'|'TXT'|'SRV'|'NS', name: string, content: string, ttl?: number, proxied?: boolean, priority?: number, data?: object }`
- ขั้นตอน: validate → blacklist check → call CF create → audit log

### PATCH /api/dns/records/:id
- Role: user+ (หรือ admin)
- Body: `{ ...partial of above }` (เฉพาะฟิลด์ที่แก้)
- ขั้นตอน: validate partial → blacklist check → call CF update → audit log

### DELETE /api/dns/records/:id
- Role: admin+
- ขั้นตอน: call CF delete → audit log

## Blacklist
### GET /api/blacklist
- Role: admin+
- 200 → `{ items: Blacklist[] }`
- Blacklist: `{ id, field: 'name'|'content'|'both', pattern: string, is_regex: boolean, type: 'ANY'|'A'|'AAAA'|'CNAME'|'MX'|'TXT'|'SRV'|'NS', description?: string, created_by, created_at }`

### POST /api/blacklist
- Role: admin+
- Body: `{ field, pattern, is_regex, type, description? }`

### PATCH /api/blacklist/:id
- Role: admin+
- Body: partial above

### DELETE /api/blacklist/:id
- Role: admin+

## Users (Owner Only)
### GET /api/users
- Role: owner
- 200 → `{ items: { id, email, role, is_active, created_at }[] }`

### PATCH /api/users/:id/role
- Role: owner
- Body: `{ role: 'user'|'admin' }` (owner ไม่แก้ตัวเอง)

### PATCH /api/users/:id/deactivate
- Role: owner
- Body: `{ is_active: boolean }`

## Errors — codes (ตัวอย่าง)
- `validation_error`
- `unauthorized`
- `forbidden`
- `not_found`
- `cf_api_error`
- `blacklist_blocked`
- `conflict`
- `server_error`