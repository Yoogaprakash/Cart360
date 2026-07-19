-- ============================================================================
-- Cart360 — Seed Data
-- Run once after schema.sql on a fresh database. Idempotent (safe to re-run).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Default Subscription Plans
-- ----------------------------------------------------------------------------
INSERT INTO subscription_plans (
    name, code, description, monthly_price, yearly_price, currency,
    max_users, max_employees, max_products, max_customers, max_suppliers,
    max_monthly_invoices, max_monthly_quotations, max_monthly_prints, max_storage_mb, max_warehouses,
    can_export_pdf, can_export_excel, can_print, can_add_logo, can_add_gst, can_add_multi_branch, can_use_api,
    is_active, sort_order
) VALUES
    ('Free', 'FREE', 'Get started with basic billing for very small businesses.',
        0, 0, 'INR',
        1, 0, 25, 25, 10,
        20, 10, 20, 50, 1,
        false, false, true, false, false, false, false,
        true, 1),
    ('Starter', 'STARTER', 'For small businesses ready to grow with GST billing.',
        499, 4999, 'INR',
        3, 2, 200, 200, 50,
        150, 100, 300, 500, 1,
        true, false, true, true, true, false, false,
        true, 2),
    ('Professional', 'PROFESSIONAL', 'Multi-user, multi-branch billing with full reporting.',
        1499, 14999, 'INR',
        10, 8, 2000, 2000, 300,
        1000, 500, 2000, 5000, 3,
        true, true, true, true, true, true, false,
        true, 3),
    ('Enterprise', 'ENTERPRISE', 'Unlimited scale with API access for large operations.',
        4999, 49999, 'INR',
        100, 100, 100000, 100000, 5000,
        50000, 20000, 100000, 51200, 20,
        true, true, true, true, true, true, true,
        true, 4)
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Super Admin bootstrap user (tenant_id = NULL).
--
-- Deliberately NOT seeded with any password here — a credential-shaped
-- string in a source-controlled script is a liability even as a
-- "placeholder", since it inevitably ends up copy-pasted into a real
-- deployment. Instead, the row is created with an unusable password_hash
-- so no login can ever succeed until the operator runs the one-time
-- bootstrap command, which generates a fresh random password locally,
-- hashes it with the API's real BCrypt work factor, and prints the
-- password once to the operator's terminal:
--
--   dotnet run --project server/src/Cart360.API -- seed-superadmin --email you@company.com
--
-- See docs/deployment.md "First deploy" section.
-- ----------------------------------------------------------------------------
INSERT INTO users (
    tenant_id, first_name, last_name, email, password_hash, role,
    is_email_verified, is_active
) VALUES (
    NULL, 'Super', 'Admin', 'superadmin@cart360.app',
    'UNSET-RUN-SEED-SUPERADMIN-COMMAND', -- not a valid BCrypt hash: login impossible until reset
    'SuperAdmin', true, true
)
ON CONFLICT DO NOTHING;
