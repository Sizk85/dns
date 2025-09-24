-- Create database schema for Cloudflare DNS Manager
-- Run this with: psql $DATABASE_URL -f setup.sql

-- Create role enum type
DO $$ BEGIN
    CREATE TYPE role AS ENUM ('user', 'admin', 'owner');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    password_hash TEXT NOT NULL,
    role role NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token VARCHAR(512) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    actor_user_id INTEGER NOT NULL REFERENCES users(id),
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(64) NOT NULL,
    target_id VARCHAR(128),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create blacklist table
CREATE TABLE IF NOT EXISTS blacklist (
    id SERIAL PRIMARY KEY,
    field VARCHAR(16) NOT NULL,
    pattern TEXT NOT NULL,
    is_regex BOOLEAN NOT NULL DEFAULT false,
    type VARCHAR(8) NOT NULL DEFAULT 'ANY',
    description TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create owner user (password: ChangeMe123!)
-- Hash generated with bcrypt rounds=12
INSERT INTO users (email, password_hash, role, name, is_active)
VALUES (
    'owner@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVTvxm2lW',
    'owner',
    'Owner',
    true
) ON CONFLICT (email) DO NOTHING;

-- Show completion message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed!';
    RAISE NOTICE 'Owner user: owner@example.com / ChangeMe123!';
END $$;
