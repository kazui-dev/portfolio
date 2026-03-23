-- Add 'is_unlisted' column to notes table
ALTER TABLE notes ADD COLUMN is_unlisted INTEGER NOT NULL DEFAULT 0;