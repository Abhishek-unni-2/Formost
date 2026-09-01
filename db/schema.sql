-- ============================================================
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
  (1, 'Malappuram', 'Tirur'),
  (2, 'Kozhikode', 'Calicut'),
  (3, 'Thrissur', 'Thrissur'),
  (4, 'Ernakulam', 'Kochi')
ON CONFLICT (id) DO NOTHING;

-- ---------- seed: users ----------
INSERT INTO users (id, name, role, pass, district_id, phone, email, photo) VALUES
  (1, 'Ibrahim Jaseem', 'Head Admin', 'admin123', 0, '', '', ''),
  (2, 'Mohammed Asfan.m', 'Head Admin', 'admin123', 0, '', '', ''),
  (3, 'Mohammed Rizwan.m', 'Head Admin', 'admin123', 0, '', '', ''),
  (4, 'Mohammed Razal.m', 'Head Admin', 'admin123', 0, '', '', ''),
  (5, 'Nasrin', 'Telecaller', 'nasrin123', 1, '', '', ''),
  (6, 'Femina', 'Accounts', 'femina123', 1, '', '', ''),
  (7, 'Shaheel', 'Finance', 'shaheel123', 1, '', '', ''),
  (8, 'Asfan', 'Purchase', 'asfan123', 1, '', '', ''),
  (9, 'Habeebka', 'Supervisor', 'habeebka123', 1, '', '', ''),
  (10, 'Salim', 'Sales Executive', 'salim123', 1, '', '', ''),
  (11, 'Kozhikode Admin', 'District Admin', 'klda123', 2, '', '', '')
ON CONFLICT (id) DO NOTHING;

-- ---------- seed: steps ----------
INSERT INTO steps (num, icon, title, role, dept, description) VALUES
  ('01', 'fa-users', 'Lead generation', 'Telecaller', 'Marketing', 'Leads generated via Meta Ads and Google Ads. Telecaller receives and manages all incoming leads.'),
  ('02', 'fa-headset', 'Telecalling & filter', 'Telecaller', 'Sales', 'Telecaller qualifies and filters leads. Genuine leads forwarded to Sales Executive for site visit.'),
  ('03', 'fa-house-chimney-check', 'Site visit', 'Sales Executive', 'Sales', 'Sales Executive visits the customer site to assess requirements.'),
  ('04', 'fa-file-signature', 'Sales closure', 'Sales Executive', 'Sales', 'Sales Executive closes the sale, collects advance payment and documents. Supervisor notified for documentation.'),
  ('05', 'fa-folder-open', 'Documentation', 'Supervisor', 'Operations', 'Supervisor starts documentation process after sales closure.'),
  ('06', 'fa-building-columns', 'Loan processing', 'Supervisor', 'Operations', 'Supervisor handles loan processing if required.'),
  ('07', 'fa-circle-check', 'Accounts verification', 'Supervisor', 'Operations', 'Supervisor coordinates accounts verification and payment confirmation.'),
  ('08', 'fa-cart-shopping', 'Purchase', 'Supervisor', 'Operations', 'Supervisor oversees material procurement.'),
  ('09', 'fa-truck', 'Material delivery', 'Supervisor', 'Operations', 'Supervisor manages material delivery to site.'),
  ('10', 'fa-hard-hat', 'Structure work', 'Supervisor', 'Technical', 'Supervisor assigns and manages structure work on site.'),
  ('11', 'fa-bolt', 'Electrical installation', 'Supervisor', 'Technical', 'Supervisor oversees electrical installation and commissioning.'),
  ('12', 'fa-certificate', 'KSEB approval', 'Supervisor', 'Technical', 'Supervisor submits final documents to KSEB for net metering approval.'),
  ('13', 'fa-indian-rupee-sign', 'Payment collection', 'Accounts', 'Accounts', 'Accounts collects pending balance payment from customer.'),
  ('14', 'fa-phone-volume', 'Feedback calls', 'Telecaller', 'CX', 'Telecaller conducts feedback calls for the first 4 months post-installation.'),
  ('15', 'fa-handshake-simple', 'Referral collection', 'Telecaller', 'CX', 'Telecaller collects referrals and confirms subsidy amount credited.')
ON CONFLICT (num) DO NOTHING;

-- ---------- seed: leads (demo) ----------
INSERT INTO leads (id, name, phone, location, system, source, stage, status, notes, date, district_id) VALUES
  (1, 'Rajesh Kumar', '+91 94471 23456', 'Tirur', '3 kW', 'Meta Ad', 3, 'active', 'Site visit scheduled', '2026-06-01', 1),
  (2, 'Anitha Thomas', '+91 98443 56789', 'Kochi', '5 kW', 'Google Ad', 12, 'active', 'KSEB docs submitted', '2026-05-28', 4),
  (3, 'Suresh Nair', '+91 70124 89012', 'Calicut', '4 kW', 'Referral', 15, 'closed', 'Done', '2026-05-20', 2),
  (4, 'Bindu Menon', '+91 91884 34567', 'Perinthalmanna', '3 kW', 'Instagram', 4, 'active', 'Advance received', '2026-06-02', 1),
  (5, 'Lekha P.', '+91 93674 12345', 'Kondotty', '3 kW', 'WhatsApp', 2, 'pending', 'Follow-up needed', '2026-06-03', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO settings (id, data) VALUES (1, '{}'::jsonb) ON CONFLICT (id) DO NOTHING;

-- keep serial sequences ahead of the seeded ids
SELECT setval(pg_get_serial_sequence('districts', 'id'), GREATEST((SELECT MAX(id) FROM districts), 1));
SELECT setval(pg_get_serial_sequence('users', 'id'),     GREATEST((SELECT MAX(id) FROM users), 1));
SELECT setval(pg_get_serial_sequence('leads', 'id'),      GREATEST((SELECT MAX(id) FROM leads), 1));
SELECT setval(pg_get_serial_sequence('quotations', 'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM quotations), 1));
