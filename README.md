# Cart360

A multi-tenant SaaS billing, quotation, inventory, and business management
platform — a Tally/Zoho Books/Vyapar equivalent. Single shared database,
tenant-isolated by a `TenantId` discriminator enforced through EF Core global
query filters, with role-based access (Super Admin, Company Admin, Employee
with granular per-module permissions, and read-only Company User) and a
plan-based subscription system that gates both hard limits (products,
invoices/month, users, storage, ...) and feature flags (PDF export, GST,
multi-branch, API access, ...).

See [`docs/architecture.md`](docs/architecture.md) for the full design
rationale, [`docs/database-schema.md`](docs/database-schema.md) for the data
model, and [`docs/folder-structure.md`](docs/folder-structure.md) for the
repo layout.

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React 19, Vite, React Router, TanStack Query, MUI, React Hook Form + Zod, TanStack Table, react-to-print, @react-pdf/renderer |
| Backend | ASP.NET Core (.NET 10), Clean Architecture (Domain/Application/Infrastructure/API), EF Core, AutoMapper, FluentValidation, JWT + refresh-token auth |
| Database | PostgreSQL (Supabase in production, local Postgres in dev) |
| Deployment | GitHub Pages (frontend) · Render (backend, Docker) · Supabase (database) |

## Repo layout

```
Cart360/
├── client/     React 19 + Vite SPA
├── server/     ASP.NET Core Clean Architecture solution (Cart360.Domain/Application/Infrastructure/API)
├── database/   schema.sql + seed.sql — human-readable mirror of the EF Core migrations
├── docs/       Architecture, database schema, folder structure, deployment guide
└── render.yaml, .github/workflows/  Deployment configs — see docs/deployment.md
```

## Local development

### Prerequisites

- Node.js 20+
- .NET 10 SDK
- PostgreSQL 16+ running locally (or point `ConnectionStrings:DefaultConnection` at any reachable Postgres)

### Backend

```
cd server/src/Cart360.API
dotnet run
```

Applies EF Core migrations and seeds baseline data automatically on startup
(see the "Startup migration + seed" block in `Program.cs`), then listens on
`http://localhost:5284` (see `Properties/launchSettings.json`). First run:
create your Super Admin login —

```
dotnet run -- seed-superadmin --email you@yourcompany.com
```

This prints a one-time generated password (never shown again) for the
`SuperAdmin` row `DbSeeder` creates on first migration.

### Frontend

```
cd client
npm install
npm run dev
```

Serves on `http://localhost:5173`, calling the API at the URL in
`client/.env.development` (`VITE_API_BASE_URL`) — keep this in sync with
whatever port the API actually listens on locally.

### Running both together

Register a company at `/register`, verify the OTP emailed to the admin
(configure a local SMTP catch-all like Mailpit in
`appsettings.Development.json`'s `Smtp` section, or check the API console log
— a failed send is logged, not fatal, so "Resend code" always works once SMTP
is reachable), then approve the company from the Super Admin login at
`/admin/companies`.

## Deployment

Full step-by-step instructions (Supabase project setup, Render Blueprint,
GitHub Pages + Actions, env var reference, troubleshooting) are in
[`docs/deployment.md`](docs/deployment.md). Short version:

1. **Supabase** — create a project, copy the transaction-pooler connection string.
2. **Render** — New → Blueprint → point at `render.yaml`, fill in the prompted secrets.
3. **GitHub Pages** — Settings → Pages → Source: GitHub Actions; add the `VITE_API_BASE_URL` repo secret; push to `main`.

## Known simplifications

Documented in code comments at the relevant call sites, not silently cut:

- GST math assumes intra-state transactions only (CGST+SGST split); inter-state IGST/place-of-supply is not modeled.
- Profit & Loss's cost-of-goods-sold is approximated as total purchase value for the period, not matched to the specific units sold (no FIFO/weighted-average costing layer).
- Quotation → Invoice conversion is two separate commits (invoice create, then quotation status update) rather than one atomic transaction — a small, non-catastrophic risk window under concurrent access.
- Invoice/Purchase/Quotation numbering is `{prefix}{count+1:D5}` per tenant — not fully race-safe under concurrent creates from the same tenant, acceptable for expected load.
