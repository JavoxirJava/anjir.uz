CREATE TYPE difficulty_level AS ENUM ('low', 'medium', 'high');

ALTER TABLE assignments
  ADD COLUMN difficulty_level difficulty_level NOT NULL DEFAULT 'medium',
  ADD COLUMN is_for_disabled  BOOLEAN          NOT NULL DEFAULT FALSE;
