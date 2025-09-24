// Auto setup script for production deployment
const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  
  const client = new Client({ 
    connectionString: process.env.DATABASE_URL 
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create role enum
    try {
      await client.query(`CREATE TYPE role AS ENUM ('user', 'admin', 'owner')`);
      console.log('✅ Created role enum');
    } catch (error) {
      if (error.code === '42710') { // Type already exists
        console.log('ℹ️  Role enum already exists');
      } else {
        throw error;
      }
    }

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        password_hash TEXT NOT NULL,
        role role NOT NULL DEFAULT 'user',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✅ Created users table');

    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        token VARCHAR(512) NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✅ Created sessions table');

    // Create audit_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        actor_user_id INTEGER NOT NULL REFERENCES users(id),
        action VARCHAR(64) NOT NULL,
        target_type VARCHAR(64) NOT NULL,
        target_id VARCHAR(128),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✅ Created audit_logs table');

    // Create blacklist table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blacklist (
        id SERIAL PRIMARY KEY,
        field VARCHAR(16) NOT NULL,
        pattern TEXT NOT NULL,
        is_regex BOOLEAN NOT NULL DEFAULT false,
        type VARCHAR(8) NOT NULL DEFAULT 'ANY',
        description TEXT,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✅ Created blacklist table');

    // Create owner user
    const email = 'owner@example.com';
    const password = 'ChangeMe123!';
    const hash = await bcrypt.hash(password, 12);

    const result = await client.query(`
      INSERT INTO users (email, password_hash, role, name, is_active)
      VALUES ($1, $2, 'owner', 'Owner', true)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [email, hash]);

    if (result.rows.length > 0) {
      console.log('✅ Owner user created:', email);
    } else {
      console.log('ℹ️  Owner user already exists:', email);
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('📝 Login credentials:');
    console.log('   Email: owner@example.com');
    console.log('   Password: ChangeMe123!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
