CREATE TABLE IF NOT EXISTS signups (
  email TEXT NOT NULL,
  ts INTEGER NOT NULL,
  source TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_signups_email ON signups (email);
