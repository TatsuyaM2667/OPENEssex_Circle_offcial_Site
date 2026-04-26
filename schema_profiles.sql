-- Migration: Add profiles table for member profiles
-- Run:
--   npx wrangler d1 execute open-essex-db --local --file=./schema_profiles.sql
--   npx wrangler d1 execute open-essex-db --remote --file=./schema_profiles.sql

CREATE TABLE IF NOT EXISTS profiles (
  uid TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  role TEXT DEFAULT 'Member',
  skills TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  website_url TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
