# Project Structure

src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
      logout/route.ts
    (dashboard)/
      layout.tsx
      page.tsx                 # dashboard overview
      dns/
        page.tsx               # list records + filters
        new/page.tsx           # add record form (หรือใช้ dialog component)
        [id]/edit/page.tsx     # edit record form
      users/                   # owner only
        page.tsx               # list + role change + deactivate
      blacklist/
        page.tsx               # list + create/edit/delete patterns
    api/
      auth/
        login/route.ts
        register/route.ts
        session/route.ts
      dns/
        records/route.ts       # GET(list), POST(create)
        records/[id]/route.ts  # PATCH(update), DELETE(delete)
      blacklist/
        route.ts               # GET, POST
        [id]/route.ts          # PATCH, DELETE
      users/
        route.ts               # GET (owner)
        [id]/role/route.ts     # PATCH role (owner)
        [id]/deactivate/route.ts # PATCH (owner)
  components/
    ui/                        # shadcn components wrapper
    dns/
      record-table.tsx
      record-form.tsx
      delete-dialog.tsx
    blacklist/
      blacklist-table.tsx
      blacklist-form.tsx
  db/
    schema.ts
    client.ts                  # drizzle client
  lib/
    auth.ts                    # auth helpers (JWT/session)
    rbac.ts                    # role guards
    cloudflare.ts              # API wrapper
    i18n.ts                    # i18n helpers
    blacklist.ts               # pattern matching helpers
    validation/
      dns.ts                   # zod schemas per record type
      user.ts
      blacklist.ts
  styles/
    globals.css
  middleware.ts                # protect routes based on session/role

public/
  favicon.ico

root files:
  requirements.md
  .cursorrules
  tech.md
  api-contracts.md
  rbac.md
  ui-spec.md
  task.md
  env.example
  ops.md
  cloudflare-api-map.md
  security.md
  drizzle.config.ts
  package.json
  tsconfig.json
  next.config.mjs