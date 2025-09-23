# Cloudflare API Map (v4)

Base: `https://api.cloudflare.com/client/v4`
Auth: Header `Authorization: Bearer <CF_API_TOKEN>`

## DNS Records
- List: `GET /zones/{zone_id}/dns_records`
  - Query: `type`, `name`, `page`, `per_page`
- Create: `POST /zones/{zone_id}/dns_records`
  - Body (ตัวอย่าง A): `{ "type":"A", "name":"app", "content":"1.2.3.4", "ttl":120, "proxied":true }`
- Update: `PATCH /zones/{zone_id}/dns_records/{id}` (หรือ `PUT`)
  - Body: partial fields
- Delete: `DELETE /zones/{zone_id}/dns_records/{id}`

## Zones
- Get by name: `GET /zones?name=example.com`
