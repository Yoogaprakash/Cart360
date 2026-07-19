# Cart360 — Deployment Guide

Three managed services, all free-tier-friendly:

| Layer | Service | What lives there |
|---|---|---|
| Database | [Supabase](https://supabase.com) | PostgreSQL — the single shared `cart360` database for every tenant |
| Backend | [Render](https://render.com) | The ASP.NET Core API, built from `server/Dockerfile` |
| Frontend | [GitHub Pages](https://pages.github.com) | The static Vite build, deployed by `.github/workflows/deploy-client.yml` |

Deploy in this order — the API needs the database, and the frontend needs the API's URL.

## 1. Supabase (database)

1. Create a project at [supabase.com](https://supabase.com/dashboard) (any region close to your Render region).
2. Once provisioned, go to **Project Settings → Database → Connection string**. Supabase gives you two connection modes:
   - **Transaction pooler** (port `6543`) — use this for the API's `DefaultConnection`. It's PgBouncer-fronted, which is what you want for a web app opening many short-lived connections.
   - **Direct connection** (port `5432`) — only needed if you run EF Core migrations from your own machine against the hosted database (rare; the API migrates itself on startup — see step 3 below).
3. Copy the **transaction pooler** connection string and convert it to the Npgsql keyword format EF Core expects:
   ```
   Host=aws-0-<region>.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.<project-ref>;Password=<your-db-password>;SSL Mode=Require;Trust Server Certificate=true
   ```
   (Supabase's dashboard shows a `postgresql://...` URI — swap it into the `Key=Value;` shape above, or use `Npgsql.NpgsqlConnectionStringBuilder` locally to convert it.)
4. That's it — no manual schema setup needed. The API runs `Database.MigrateAsync()` on every startup (see `Program.cs`), so the first deploy creates the full schema from the EF Core migrations in `server/src/Cart360.Infrastructure/Persistence/Migrations`. `database/schema.sql` is kept as a human-readable mirror of the same schema for review, not an alternate source of truth.

   For a stricter production release process, disable the auto-migrate block in `Program.cs` and instead run migrations as an explicit CI/CD step:
   ```
   dotnet ef database update --project server/src/Cart360.Infrastructure --startup-project server/src/Cart360.API --connection "<direct connection string>"
   ```

## 2. Render (backend API)

**Option A — Blueprint (recommended):** In the Render dashboard, **New +** → **Blueprint**, connect this repo, and point it at `render.yaml` in the repo root. Render reads the service definition (Docker build from `server/Dockerfile`, health check at `/health`) and prompts you for every `sync: false` env var.

**Option B — Manual Web Service:** New + → Web Service → connect the repo → Runtime: **Docker** → Dockerfile path `server/Dockerfile`, Docker context `server`.

Either way, set these environment variables (see `render.yaml` for the full annotated list):

| Variable | Example | Notes |
|---|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` | |
| `ConnectionStrings__DefaultConnection` | *(Supabase pooler string from step 1.3)* | |
| `Jwt__Key` | *(32+ random chars)* | Render's Blueprint auto-generates this (`generateValue: true`); never reuse the dev key from `appsettings.Development.json` |
| `Jwt__Issuer` / `Jwt__Audience` | `Cart360` / `Cart360Client` | Must match what the frontend expects (it doesn't need to know these — they're server-internal token claims) |
| `Smtp__Host`, `Smtp__Port`, `Smtp__UseSsl`, `Smtp__Username`, `Smtp__Password`, `Smtp__FromEmail`, `Smtp__FromName` | *(your SMTP provider)* | Any transactional email provider works (SendGrid, Mailgun, Postmark, Resend, etc.) — used for OTP/verification emails |
| `Cors__AllowedOrigins__0` | `https://<your-github-username>.github.io` | **No trailing slash.** Must be the GitHub Pages *origin*, not the full URL with the repo path |

Render sets `$PORT` automatically; the Dockerfile's entrypoint already binds Kestrel to it (`ASPNETCORE_URLS=http://0.0.0.0:${PORT:-8080}`), so nothing else to configure there.

**First deploy checklist:**
- Confirm `GET https://<your-render-service>.onrender.com/health` returns `{"status":"healthy",...}`.
- Create the Super Admin login by opening a shell on the Render service (Dashboard → your service → **Shell**) and running:
  ```
  dotnet Cart360.API.dll seed-superadmin --email you@yourcompany.com
  ```
  This prints a one-time generated password — store it immediately, it is never shown again. (This reassigns the password for the `SuperAdmin` row `DbSeeder` creates on first migration; see `Program.cs`'s `seed-superadmin` branch.)

## 3. GitHub Pages (frontend)

1. Repo **Settings → Pages → Source**: select **GitHub Actions** (not "Deploy from a branch").
2. Repo **Settings → Secrets and variables → Actions → New repository secret**: add `VITE_API_BASE_URL` set to your Render service's API base, e.g. `https://cart360-api.onrender.com/api`.
3. Push to `main` (or run the workflow manually from the **Actions** tab — `workflow_dispatch` is enabled). `.github/workflows/deploy-client.yml` builds `client/` with Vite and publishes `client/dist` via `actions/deploy-pages`.
4. The build sets `VITE_BASE_PATH` to `/${{ github.event.repository.name }}/` automatically, so the site serves correctly at `https://<username>.github.io/<repo-name>/` whatever the repo is actually named — no hardcoded path to maintain. (`client/vite.config.ts` and `client/public/404.html` both derive the base path the same way; see the comments in each if you ever need to serve from a custom domain instead, in which case both should be simplified to `base: '/'`.)
5. Once live, go back to Render and confirm `Cors__AllowedOrigins__0` is set to exactly this Pages origin (`https://<username>.github.io`, no path, no trailing slash) — a mismatch here is the most common first-deploy failure (browser console shows a CORS error, not a 401/500).

## Local development env vars (reference)

| File | Key vars |
|---|---|
| `client/.env.development` | `VITE_API_BASE_URL=http://localhost:5284/api` (matches `launchSettings.json`'s `http` profile — keep these two in sync if you change one) |
| `server/src/Cart360.API/appsettings.Development.json` | Local Postgres connection string, dev JWT key, local SMTP catch-all (e.g. Mailpit/MailHog on `localhost:1025`), CORS allowing `http://localhost:5173` |

Nothing in `appsettings.Development.json` is a secret worth rotating — it's a local-only dev database and a key explicitly named `dev-only-signing-key-never-use-in-production`. Production secrets live only in Render's environment variables and GitHub's repo secrets, never committed.

## Troubleshooting

- **Frontend loads but every API call fails with a CORS error** — `Cors__AllowedOrigins__0` on Render doesn't exactly match the Pages origin (check for a trailing slash or `http` vs `https`).
- **Deep link (e.g. bookmark to `/app/invoices/123`) 404s on GitHub Pages** — this is handled by `client/public/404.html`'s redirect trick; if it's still 404ing, confirm Pages' Source is set to **GitHub Actions** (the branch-based Pages source doesn't run the workflow that copies `404.html` into the build).
- **Render deploy succeeds but health check fails** — check the Render service logs for a migration error (usually a bad `ConnectionStrings__DefaultConnection` — the transaction pooler string needs `SSL Mode=Require;Trust Server Certificate=true` for Npgsql to connect to Supabase).
- **OTP verification emails never arrive** — check the Render logs for `Failed to send EmailVerification OTP email`; the app deliberately doesn't fail the request when SMTP is down (see `AuthService.IssueAndSendOtpAsync`), so registration/login still "succeeds" even if the email silently fails. Use "Resend code" once SMTP is fixed, or read `Smtp__*` env vars for typos.
