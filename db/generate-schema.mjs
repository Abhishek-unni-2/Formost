// Regenerates db/schema.sql (DDL + seed) from src/data/mockData.js.
// Run:  node db/generate-schema.mjs > db/schema.sql
import { STEPS, DISTRICTS, USERS, LEADS } from '../src/data/mockData.js';

const q = (v) => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
};

const rows = (arr, cols, map) =>
  arr.map((r) => `  (${cols.map((c) => q(map(r)[c])).join(', ')})`).join(',\n');

const out = `-- ============================================================
--  FORMOST OPS — Neon / Postgres schema + seed
--  Generated from src/data/mockData.js
--
--  Run once against your Neon database, e.g. in the Neon SQL Editor,
--  or:  psql "$DATABASE_URL" -f db/schema.sql
--  Safe to re-run (IF NOT EXISTS + ON CONFLICT DO NOTHING).
-- ============================================================

CREATE TABLE IF NOT EXISTS districts (
  id        serial PRIMARY KEY,
  name      text NOT NULL,
  location  text DEFAULT ''
);

CREATE TABLE IF NOT EXISTS users (
  id           serial PRIMARY KEY,
  name         text NOT NULL,
  role         text NOT NULL,
  pass         text NOT NULL,
  district_id  integer DEFAULT 0,
  phone        text DEFAULT '',
  email        text DEFAULT '',
  photo        text DEFAULT ''
);

CREATE TABLE IF NOT EXISTS steps (
  num          text PRIMARY KEY,
  icon         text DEFAULT 'fa-circle-dot',
  title        text NOT NULL,
  role         text DEFAULT '',
  dept         text DEFAULT '',
  description  text DEFAULT ''
);

CREATE TABLE IF NOT EXISTS leads (
  id           serial PRIMARY KEY,
  name         text NOT NULL,
  phone        text DEFAULT '',
  location     text DEFAULT '',
  system       text DEFAULT '',
  source       text DEFAULT '',
  stage        integer DEFAULT 1,
  status       text DEFAULT 'pending',
  notes        text DEFAULT '',
  date         text DEFAULT '',
  district_id  integer DEFAULT 1
);

CREATE TABLE IF NOT EXISTS quotations (
  id           serial PRIMARY KEY,
  customer_name text NOT NULL,
  place        text DEFAULT '',
  phone        text DEFAULT '',
  kw           text DEFAULT '3',
  amount       integer DEFAULT 0,
  date         text DEFAULT '',
  notes        text DEFAULT '',
  created_by   text DEFAULT '',
  district_id  integer DEFAULT 1
);

CREATE TABLE IF NOT EXISTS settings (
  id    integer PRIMARY KEY DEFAULT 1,
  data  jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- ---------- seed: districts ----------
INSERT INTO districts (id, name, location) VALUES
${rows(DISTRICTS, ['id', 'name', 'location'], (d) => d)}
ON CONFLICT (id) DO NOTHING;

-- ---------- seed: users ----------
INSERT INTO users (id, name, role, pass, district_id, phone, email, photo) VALUES
${rows(
  USERS,
  ['id', 'name', 'role', 'pass', 'district_id', 'phone', 'email', 'photo'],
  (u) => ({ ...u, district_id: u.districtId })
)}
ON CONFLICT (id) DO NOTHING;

-- ---------- seed: steps ----------
INSERT INTO steps (num, icon, title, role, dept, description) VALUES
${rows(
  STEPS,
  ['num', 'icon', 'title', 'role', 'dept', 'description'],
  (s) => ({ ...s, description: s.desc })
)}
ON CONFLICT (num) DO NOTHING;

-- ---------- seed: leads (demo) ----------
INSERT INTO leads (id, name, phone, location, system, source, stage, status, notes, date, district_id) VALUES
${rows(
  LEADS,
  ['id', 'name', 'phone', 'location', 'system', 'source', 'stage', 'status', 'notes', 'date', 'district_id'],
  (l) => ({ ...l, district_id: l.districtId })
)}
ON CONFLICT (id) DO NOTHING;

INSERT INTO settings (id, data) VALUES (1, '{}'::jsonb) ON CONFLICT (id) DO NOTHING;

-- keep serial sequences ahead of the seeded ids
SELECT setval(pg_get_serial_sequence('districts', 'id'), GREATEST((SELECT MAX(id) FROM districts), 1));
SELECT setval(pg_get_serial_sequence('users', 'id'),     GREATEST((SELECT MAX(id) FROM users), 1));
SELECT setval(pg_get_serial_sequence('leads', 'id'),      GREATEST((SELECT MAX(id) FROM leads), 1));
SELECT setval(pg_get_serial_sequence('quotations', 'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM quotations), 1));
`;

process.stdout.write(out);
