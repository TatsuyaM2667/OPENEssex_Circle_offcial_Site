-- Migration: Add calendar_events table for shared calendar
-- Run:
--   npx wrangler d1 execute open-essex-db --local --file=./schema_calendar.sql
--   npx wrangler d1 execute open-essex-db --remote --file=./schema_calendar.sql

CREATE TABLE IF NOT EXISTS calendar_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  event_date TEXT NOT NULL,         -- YYYY-MM-DD format
  start_time TEXT DEFAULT '',       -- HH:MM format (optional)
  end_time TEXT DEFAULT '',         -- HH:MM format (optional)
  color TEXT DEFAULT '#ff4766',     -- User-chosen color for the event dot
  author_uid TEXT NOT NULL,         -- Firebase UID of the creator
  author_name TEXT NOT NULL,        -- Display name at time of creation
  author_avatar TEXT DEFAULT '',    -- Avatar URL at time of creation
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_author ON calendar_events(author_uid);
