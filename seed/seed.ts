import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import { users } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const { Client } = pkg;

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client);

  const email = process.env.SEED_OWNER_EMAIL || 'owner@example.com';
  const password = process.env.SEED_OWNER_PASSWORD || '1212312121.';

  const hash = await bcrypt.hash(password, 12);

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length === 0) {
    await db.insert(users).values({ email, password_hash: hash, role: 'owner', name: 'Owner' });
    console.log('Owner created:', email);
  } else {
    console.log('Owner already exists');
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
