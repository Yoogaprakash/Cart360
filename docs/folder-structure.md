# Cart360 — Folder Structure

Monorepo with three independently-deployable pieces (`client` → GitHub
Pages, `server` → Render, `database` → Supabase), plus `docs`.

```
Cart360/
├── client/                          React 19 + Vite SPA
│   ├── public/
│   └── src/
│       ├── app/                     Router, providers (QueryClient, Theme, Auth), App shell
│       ├── assets/
│       ├── components/              Shared/reusable UI (DataTable, PageHeader, ConfirmDialog...)
│       ├── layouts/                 AppLayout (sidebar+navbar+breadcrumb), AuthLayout, PrintLayout
│       ├── lib/                     axios instance, query client, permissions helper
│       ├── hooks/                   usePermission, useSubscriptionLimits, ...
│       ├── store/                   Auth session / theme / sidebar React Contexts
│       ├── theme/                   MUI theme (light/dark tokens, glassmorphism surfaces)
│       ├── print/                   Print templates: A4, Thermal80, Thermal58, Letter
│       └── features/                One folder per module, each with api/ components/ pages/
│           ├── auth/
│           ├── dashboard/
│           ├── products/            (+ categories, brands, units as siblings)
│           ├── customers/
│           ├── suppliers/
│           ├── invoices/
│           ├── quotations/
│           ├── purchases/
│           ├── inventory/
│           ├── expenses/
│           ├── reports/
│           ├── users/
│           ├── notifications/
│           ├── company/             Company settings, printer, branding
│           ├── subscriptions/        Plan display / usage meters (Company Admin view)
│           └── superadmin/          Companies, plans, revenue, system logs (Super Admin view)
│
├── server/                          ASP.NET Core Clean Architecture solution
│   ├── Cart360.sln
│   ├── src/
│   │   ├── Cart360.Domain/          Entities, enums, exceptions — zero framework dependencies
│   │   │   ├── Entities/
│   │   │   │   ├── Platform/        Tenant, SubscriptionPlan, TenantSubscription, PlatformAuditLog
│   │   │   │   ├── Identity/        User, UserPermission, RefreshToken, OtpCode, Notification, ActivityLog
│   │   │   │   ├── Catalog/         Warehouse, Category, Brand, Unit, Product, ProductBatch
│   │   │   │   ├── Sales/           Customer, Invoice, InvoiceItem, Quotation, QuotationItem, SalesReturn...
│   │   │   │   ├── Purchasing/      Supplier, Purchase, PurchaseItem, PurchaseReturn...
│   │   │   │   ├── Inventory/       StockLedgerEntry, StockAdjustment, StockAdjustmentItem
│   │   │   │   └── Finance/         Expense, ExpenseCategory, Income, IncomeCategory, Payment, Receipt
│   │   │   ├── Enums/
│   │   │   ├── Common/              BaseEntity, ITenantEntity, ISoftDelete, IAuditable interfaces
│   │   │   └── Exceptions/          Domain-level exceptions
│   │   │
│   │   ├── Cart360.Application/     DTOs, validators, service interfaces/implementations
│   │   │   ├── Common/
│   │   │   │   ├── Interfaces/      ITenantContext, ICurrentUserService, IEmailService, ISubscriptionLimitService...
│   │   │   │   ├── Models/          PagedResult<T>, ApiResponse<T>
│   │   │   │   └── Behaviors/       Validation/logging pipeline behaviors
│   │   │   ├── Mappings/            AutoMapper profiles
│   │   │   └── Features/            One folder per module: DTOs + validators + service interface/impl
│   │   │
│   │   ├── Cart360.Infrastructure/  EF Core, repositories, external services
│   │   │   ├── Persistence/
│   │   │   │   ├── Cart360DbContext.cs
│   │   │   │   ├── Configurations/  IEntityTypeConfiguration<T> per entity (Fluent API)
│   │   │   │   ├── Migrations/      EF Core migrations
│   │   │   │   ├── Interceptors/    Audit/soft-delete/tenant-stamping SaveChanges interceptor
│   │   │   │   └── Repositories/    Generic + module-specific repository implementations
│   │   │   ├── Identity/            JWT token generator, password hasher
│   │   │   ├── Services/            Email (SMTP), PDF, storage/upload
│   │   │   └── Files/               File storage abstraction (local/S3-compatible)
│   │   │
│   │   └── Cart360.API/             Composition root
│   │       ├── Controllers/
│   │       ├── Middleware/          Global exception handler, tenant resolution
│   │       ├── Filters/             Permission-check action filter
│   │       ├── Extensions/          ServiceCollection extension methods (DI wiring per layer)
│   │       └── Program.cs
│   │
│   └── tests/
│       ├── Cart360.UnitTests/       Domain + Application logic (no DB)
│       └── Cart360.IntegrationTests/  Full API + Testcontainers Postgres
│
├── database/
│   ├── schema.sql                   Full DDL (reviewable snapshot of the EF Core migration)
│   └── seed.sql                     Subscription plans + Super Admin bootstrap
│
└── docs/
    ├── architecture.md
    ├── database-schema.md
    ├── folder-structure.md          (this file)
    └── deployment.md                (added in the deployment phase)
```
