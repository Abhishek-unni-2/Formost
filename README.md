# Formost Ops - React Web Application

A structured React + Vite dashboard and pipeline management application for **Formost Power Systems**, built by restructuring and modularizing the single-file prototype `formost-ops-v3.html`.

## Key Features

1. **Dashboard (Admins Only)**: Full analytics overview, displaying metrics for total, pending, and completed leads, along with recent stage updates.
2. **Dynamic Pipeline (Flow Overview)**: Visual flow of pipeline steps with contextual drawers to view descriptions and responsible roles. Admins can add, edit, or delete stages.
3. **Leads Management**:
   - Advanced search (name, phone, location) and grouping filters.
   - Lead CRUD operations (restricted by administrative roles).
   - District-level scoping: admins only view leads belonging to their respective branch.
4. **My Work View**: Tailored tasks summary displaying leads corresponding to the logged-in user's role.
5. **Quotations Utility**: Dynamic Bill of Materials selector and invoice amount calculator, with integrated print layout and iframe PDF print wrappers.
6. **WhatsApp Notification Center**: Balance collection notifications and transition updates synced directly to WhatsApp web links.
7. **Staff Profile Control**: Base64 photo avatar uploader, personal info settings, and password updates.
8. **Admin Panel**: Dedicated pages to manage systems users and district office locations.

## Architecture

- **Frontend** — React + Vite single-page app (`src/`). No client-side router; page state lives in `App.jsx`.
- **API** — Vercel serverless functions in `api/` (`districts`, `users`, `steps`, `leads`, `quotations`, `settings`, plus `meta-webhook`). Thin REST CRUD over one table each; shared logic in `api/_crud.js`.
- **Database** — Neon (serverless Postgres). Schema + seed in `db/schema.sql`.
- **Data layer** — `src/services/dataService.js` calls the `/api/*` routes. If the API isn't reachable (e.g. plain `npm run dev` with no backend), the app falls back to **offline mock-data mode** using `src/data/mockData.js` — fully usable, but nothing persists.

## Deploying to Vercel + Neon

1. **Create the database** — in Vercel: *Project → Storage → Create Database → Neon* (or add Neon from the Marketplace). This sets `DATABASE_URL` on the project automatically. (Or create a project at [neon.tech](https://neon.tech) and paste its connection string as `DATABASE_URL` in *Project → Settings → Environment Variables*.)
2. **Load the schema** — open the Neon **SQL Editor** and paste the contents of [`db/schema.sql`](db/schema.sql). Run it once. It creates the tables and seeds districts, the 15 pipeline steps, the 11 login users, and 5 demo leads. Safe to re-run.
3. **Import the repo into Vercel** — *Add New → Project → import `Abhishek-unni-2/Formost`*. Framework preset **Vite** is auto-detected (build `vite build`, output `dist`). Deploy.
4. **(Optional) Meta Lead Ads webhook** — add env vars `META_VERIFY_TOKEN` and `META_PAGE_ACCESS_TOKEN`, then point your Meta app's `leadgen` webhook at `https://<your-app>.vercel.app/api/meta-webhook`.

That's it — the deployed site talks to the API automatically (any non-`localhost` host does). To test the API locally, install the Vercel CLI and run `vercel dev` with `DATABASE_URL` and `VITE_USE_API=1` in a `.env` file (see `.env.example`).

Regenerate `db/schema.sql` after editing mock data with: `node db/generate-schema.mjs > db/schema.sql`.

## Development Scripts

To run this application locally, you will need **Node.js (version 20 or higher)** installed on your machine.

### Installation

Navigate into the directory and run the following command to download dependencies:

```bash
npm install
```

### Run Locally

Start the Vite development server on `http://localhost:3000`:

```bash
npm run dev
```

### Production Build

Compile and bundle static files for deployment (output generated in `dist/`):

```bash
npm run build
```

### Preview Build

Locally run the production build files:

```bash
npm run preview
```

## User Directory & Default Credentials

You can use the following default usernames to log in. Click the name input field to select a user from the suggested autocomplete dropdown:

- **HQ Admins (Head Admin)**: `Ibrahim Jaseem`, `Mohammed Asfan.m`, `Mohammed Rizwan.m`, `Mohammed Razal.m` (Password: `admin123`)
- **District Admin**: `Kozhikode Admin` (Password: `klda123`)
- **Telecaller**: `Nasrin` (Password: `nasrin123`)
- **Accounts**: `Femina` (Password: `femina123`)
- **Supervisor**: `Habeebka` (Password: `habeebka123`)
- **Sales Executive**: `Salim` (Password: `salim123`)
# erp
