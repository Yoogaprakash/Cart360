-- ============================================================================
-- Cart360 — PostgreSQL Schema (Supabase)
-- ============================================================================
-- This file is a human-readable snapshot of the schema. The applied source
-- of truth is the EF Core "InitialCreate" migration generated from the
-- Cart360.Domain entity models (see docs/database-schema.md for rationale).
-- Safe to run top-to-bottom against a fresh Supabase/Postgres 15+ database.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- ============================================================================
-- SECTION 1: PLATFORM (no tenant_id — these tables describe tenants)
-- ============================================================================

CREATE TABLE subscription_plans (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name                        varchar(100) NOT NULL,
    code                        varchar(50)  NOT NULL UNIQUE, -- e.g. FREE, STARTER, PROFESSIONAL, ENTERPRISE
    description                 text,
    monthly_price               numeric(14,2) NOT NULL DEFAULT 0,
    yearly_price                numeric(14,2) NOT NULL DEFAULT 0,
    currency                    varchar(3) NOT NULL DEFAULT 'INR',
    max_users                   integer NOT NULL DEFAULT 1,
    max_employees               integer NOT NULL DEFAULT 0,
    max_products                integer NOT NULL DEFAULT 50,
    max_customers                integer NOT NULL DEFAULT 50,
    max_suppliers               integer NOT NULL DEFAULT 20,
    max_monthly_invoices        integer NOT NULL DEFAULT 50,
    max_monthly_quotations      integer NOT NULL DEFAULT 50,
    max_monthly_prints          integer NOT NULL DEFAULT 50,
    max_storage_mb              integer NOT NULL DEFAULT 100,
    max_warehouses              integer NOT NULL DEFAULT 1,
    can_export_pdf              boolean NOT NULL DEFAULT false,
    can_export_excel            boolean NOT NULL DEFAULT false,
    can_print                   boolean NOT NULL DEFAULT true,
    can_add_logo                boolean NOT NULL DEFAULT false,
    can_add_gst                 boolean NOT NULL DEFAULT false,
    can_add_multi_branch        boolean NOT NULL DEFAULT false,
    can_use_api                 boolean NOT NULL DEFAULT false,
    is_active                   boolean NOT NULL DEFAULT true,
    sort_order                  integer NOT NULL DEFAULT 0,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tenants (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name                        varchar(200) NOT NULL,
    slug                        varchar(100) NOT NULL UNIQUE,
    status                      varchar(20) NOT NULL DEFAULT 'Pending'
                                    CHECK (status IN ('Pending','Active','Suspended','Rejected')),
    gst_number                  varchar(20),
    pan_number                  varchar(20),
    address_line1               varchar(255),
    address_line2               varchar(255),
    city                        varchar(100),
    state                       varchar(100),
    postal_code                 varchar(20),
    country                     varchar(100) DEFAULT 'India',
    phone                       varchar(20),
    email                       citext NOT NULL,
    logo_url                    text,
    signature_url               text,
    terms_and_conditions        text,
    bank_name                   varchar(150),
    bank_account_number         varchar(50),
    bank_ifsc                   varchar(20),
    bank_branch                 varchar(150),
    upi_id                      varchar(100),
    upi_qr_url                  text,
    is_gst_enabled              boolean NOT NULL DEFAULT true,
    invoice_prefix              varchar(20) NOT NULL DEFAULT 'INV-',
    quotation_prefix            varchar(20) NOT NULL DEFAULT 'QUO-',
    purchase_prefix             varchar(20) NOT NULL DEFAULT 'PUR-',
    theme_color                 varchar(20) NOT NULL DEFAULT '#6366F1',
    currency                    varchar(3)  NOT NULL DEFAULT 'INR',
    language                    varchar(10) NOT NULL DEFAULT 'en',
    timezone                    varchar(50) NOT NULL DEFAULT 'Asia/Kolkata',
    approved_at                 timestamptz,
    approved_by                 uuid,
    suspended_at                timestamptz,
    suspended_reason            text,
    is_deleted                  boolean NOT NULL DEFAULT false,
    version                     integer NOT NULL DEFAULT 1,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now(),
    created_by                  uuid,
    updated_by                  uuid
);
CREATE INDEX ix_tenants_status ON tenants(status) WHERE is_deleted = false;

CREATE TABLE tenant_subscriptions (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id                     uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    billing_cycle               varchar(10) NOT NULL DEFAULT 'Monthly' CHECK (billing_cycle IN ('Monthly','Yearly')),
    start_date                  date NOT NULL,
    end_date                    date NOT NULL,
    status                      varchar(20) NOT NULL DEFAULT 'Active'
                                    CHECK (status IN ('Trial','Active','Expired','Cancelled')),
    auto_renew                  boolean NOT NULL DEFAULT true,
    price_at_purchase           numeric(14,2) NOT NULL DEFAULT 0,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_tenant_subscriptions_tenant ON tenant_subscriptions(tenant_id);
CREATE INDEX ix_tenant_subscriptions_status ON tenant_subscriptions(status);
-- only one Active subscription per tenant at a time
CREATE UNIQUE INDEX ux_tenant_subscriptions_active ON tenant_subscriptions(tenant_id) WHERE status = 'Active';

CREATE TABLE platform_audit_logs (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid REFERENCES tenants(id) ON DELETE SET NULL,
    user_id                     uuid,
    action                      varchar(100) NOT NULL,
    entity_name                 varchar(100) NOT NULL,
    entity_id                   uuid,
    old_values                  jsonb,
    new_values                  jsonb,
    ip_address                  varchar(64),
    user_agent                  varchar(255),
    created_at                  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_platform_audit_logs_tenant ON platform_audit_logs(tenant_id, created_at DESC);
CREATE INDEX ix_platform_audit_logs_entity ON platform_audit_logs(entity_name, entity_id);

-- ============================================================================
-- SECTION 2: IDENTITY
-- ============================================================================

CREATE TABLE users (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid REFERENCES tenants(id) ON DELETE CASCADE, -- NULL for SuperAdmin
    employee_code               varchar(50),
    first_name                  varchar(100) NOT NULL,
    last_name                   varchar(100),
    email                       citext NOT NULL,
    phone                       varchar(20),
    password_hash               text NOT NULL,
    role                        varchar(20) NOT NULL
                                    CHECK (role IN ('SuperAdmin','CompanyAdmin','Employee','CompanyUser')),
    is_email_verified           boolean NOT NULL DEFAULT false,
    is_active                   boolean NOT NULL DEFAULT true,
    avatar_url                  text,
    last_login_at               timestamptz,
    last_login_ip               varchar(64),
    is_deleted                  boolean NOT NULL DEFAULT false,
    version                     integer NOT NULL DEFAULT 1,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now(),
    created_by                  uuid,
    updated_by                  uuid
);
-- Email is globally unique for SuperAdmin (tenant_id IS NULL) and unique per tenant otherwise
CREATE UNIQUE INDEX ux_users_email_tenant ON users(tenant_id, email) WHERE tenant_id IS NOT NULL;
CREATE UNIQUE INDEX ux_users_email_superadmin ON users(email) WHERE tenant_id IS NULL;
CREATE INDEX ix_users_tenant ON users(tenant_id) WHERE is_deleted = false;

ALTER TABLE tenants ADD CONSTRAINT fk_tenants_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE user_permissions (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module                      varchar(50) NOT NULL, -- e.g. 'Invoices', 'Products', 'Reports'
    can_view                    boolean NOT NULL DEFAULT false,
    can_create                  boolean NOT NULL DEFAULT false,
    can_edit                    boolean NOT NULL DEFAULT false,
    can_delete                  boolean NOT NULL DEFAULT false,
    can_print                   boolean NOT NULL DEFAULT false,
    can_export                  boolean NOT NULL DEFAULT false,
    UNIQUE (user_id, module)
);

CREATE TABLE refresh_tokens (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash                  varchar(255) NOT NULL UNIQUE,
    expires_at                  timestamptz NOT NULL,
    is_remember_me              boolean NOT NULL DEFAULT false,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    created_by_ip                varchar(64),
    revoked_at                  timestamptz,
    revoked_by_ip                varchar(64),
    replaced_by_token_hash       varchar(255)
);
CREATE INDEX ix_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX ix_refresh_tokens_expiry ON refresh_tokens(expires_at) WHERE revoked_at IS NULL;

CREATE TABLE otp_codes (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     uuid REFERENCES users(id) ON DELETE CASCADE,
    email                       citext NOT NULL,
    code_hash                   varchar(255) NOT NULL,
    purpose                     varchar(30) NOT NULL
                                    CHECK (purpose IN ('EmailVerification','PasswordReset','Login2FA')),
    expires_at                  timestamptz NOT NULL,
    is_used                     boolean NOT NULL DEFAULT false,
    used_at                     timestamptz,
    attempt_count               integer NOT NULL DEFAULT 0,
    created_at                  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_otp_codes_lookup ON otp_codes(email, purpose, is_used);

CREATE TABLE notifications (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id                     uuid REFERENCES users(id) ON DELETE CASCADE, -- NULL = broadcast to whole tenant
    title                       varchar(200) NOT NULL,
    message                     text NOT NULL,
    type                        varchar(20) NOT NULL DEFAULT 'Info'
                                    CHECK (type IN ('Info','Success','Warning','Error')),
    link_url                    text,
    is_read                     boolean NOT NULL DEFAULT false,
    read_at                     timestamptz,
    created_at                  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_notifications_recipient ON notifications(tenant_id, user_id, is_read, created_at DESC);

CREATE TABLE activity_logs (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id                     uuid REFERENCES users(id) ON DELETE SET NULL,
    module                      varchar(50) NOT NULL,
    action                      varchar(100) NOT NULL,
    description                 text,
    entity_id                   uuid,
    created_at                  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_activity_logs_tenant ON activity_logs(tenant_id, created_at DESC);

-- ============================================================================
-- SECTION 3: CATALOG
-- ============================================================================

CREATE TABLE warehouses (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name                        varchar(150) NOT NULL,
    code                        varchar(30) NOT NULL,
    address                     text,
    is_default                  boolean NOT NULL DEFAULT false,
    is_active                   boolean NOT NULL DEFAULT true,
    is_deleted                  boolean NOT NULL DEFAULT false,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, code)
);
CREATE INDEX ix_warehouses_tenant ON warehouses(tenant_id) WHERE is_deleted = false;

CREATE TABLE categories (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    parent_category_id          uuid REFERENCES categories(id) ON DELETE SET NULL,
    name                        varchar(150) NOT NULL,
    description                 text,
    is_active                   boolean NOT NULL DEFAULT true,
    is_deleted                  boolean NOT NULL DEFAULT false,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, parent_category_id, name)
);
CREATE INDEX ix_categories_tenant ON categories(tenant_id) WHERE is_deleted = false;

CREATE TABLE brands (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name                        varchar(150) NOT NULL,
    description                 text,
    is_active                   boolean NOT NULL DEFAULT true,
    is_deleted                  boolean NOT NULL DEFAULT false,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, name)
);
CREATE INDEX ix_brands_tenant ON brands(tenant_id) WHERE is_deleted = false;

CREATE TABLE units (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name                        varchar(100) NOT NULL,
    short_code                  varchar(20) NOT NULL,
    is_active                   boolean NOT NULL DEFAULT true,
    is_deleted                  boolean NOT NULL DEFAULT false,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, short_code)
);
CREATE INDEX ix_units_tenant ON units(tenant_id) WHERE is_deleted = false;

CREATE TABLE products (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id                 uuid REFERENCES categories(id) ON DELETE SET NULL,
    brand_id                    uuid REFERENCES brands(id) ON DELETE SET NULL,
    unit_id                     uuid REFERENCES units(id) ON DELETE RESTRICT,
    warehouse_id                uuid REFERENCES warehouses(id) ON DELETE SET NULL,
    name                        varchar(200) NOT NULL,
    sku                         varchar(100) NOT NULL,
    barcode                     varchar(100),
    hsn_code                    varchar(20),
    gst_percent                 numeric(5,2) NOT NULL DEFAULT 0,
    cgst_percent                numeric(5,2) NOT NULL DEFAULT 0,
    sgst_percent                numeric(5,2) NOT NULL DEFAULT 0,
    igst_percent                numeric(5,2) NOT NULL DEFAULT 0,
    purchase_price              numeric(14,2) NOT NULL DEFAULT 0,
    selling_price               numeric(14,2) NOT NULL DEFAULT 0,
    mrp                         numeric(14,2) NOT NULL DEFAULT 0,
    opening_stock               numeric(14,3) NOT NULL DEFAULT 0,
    current_stock               numeric(14,3) NOT NULL DEFAULT 0,
    min_stock_level             numeric(14,3) NOT NULL DEFAULT 0,
    max_stock_level             numeric(14,3),
    track_inventory              boolean NOT NULL DEFAULT true,
    track_batches                boolean NOT NULL DEFAULT false,
    image_url                   text,
    is_active                   boolean NOT NULL DEFAULT true,
    is_deleted                  boolean NOT NULL DEFAULT false,
    version                     integer NOT NULL DEFAULT 1,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now(),
    created_by                  uuid,
    updated_by                  uuid,
    UNIQUE (tenant_id, sku)
);
CREATE INDEX ix_products_tenant ON products(tenant_id) WHERE is_deleted = false;
CREATE INDEX ix_products_barcode ON products(tenant_id, barcode);
CREATE INDEX ix_products_category ON products(category_id);
CREATE INDEX ix_products_low_stock ON products(tenant_id) WHERE track_inventory = true AND current_stock <= min_stock_level;

CREATE TABLE product_batches (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id                  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id                uuid REFERENCES warehouses(id) ON DELETE SET NULL,
    batch_number                varchar(100) NOT NULL,
    expiry_date                 date,
    quantity                    numeric(14,3) NOT NULL DEFAULT 0,
    purchase_price              numeric(14,2) NOT NULL DEFAULT 0,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (product_id, batch_number, warehouse_id)
);
CREATE INDEX ix_product_batches_expiry ON product_batches(tenant_id, expiry_date);

-- ============================================================================
-- SECTION 4: PARTIES
-- ============================================================================

CREATE TABLE customers (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_code               varchar(50) NOT NULL,
    name                        varchar(200) NOT NULL,
    gst_number                  varchar(20),
    phone                       varchar(20),
    email                       citext,
    address_line1               varchar(255),
    address_line2               varchar(255),
    city                        varchar(100),
    state                       varchar(100),
    postal_code                 varchar(20),
    outstanding_amount          numeric(14,2) NOT NULL DEFAULT 0,
    credit_limit                numeric(14,2) NOT NULL DEFAULT 0,
    notes                       text,
    is_active                   boolean NOT NULL DEFAULT true,
    is_deleted                  boolean NOT NULL DEFAULT false,
    version                     integer NOT NULL DEFAULT 1,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now(),
    created_by                  uuid,
    updated_by                  uuid,
    UNIQUE (tenant_id, customer_code)
);
CREATE INDEX ix_customers_tenant ON customers(tenant_id) WHERE is_deleted = false;
CREATE INDEX ix_customers_search ON customers(tenant_id, name);

CREATE TABLE suppliers (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    supplier_code               varchar(50) NOT NULL,
    name                        varchar(200) NOT NULL,
    gst_number                  varchar(20),
    phone                       varchar(20),
    email                       citext,
    address_line1               varchar(255),
    address_line2               varchar(255),
    city                        varchar(100),
    state                       varchar(100),
    postal_code                 varchar(20),
    outstanding_amount          numeric(14,2) NOT NULL DEFAULT 0,
    notes                       text,
    is_active                   boolean NOT NULL DEFAULT true,
    is_deleted                  boolean NOT NULL DEFAULT false,
    version                     integer NOT NULL DEFAULT 1,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now(),
    created_by                  uuid,
    updated_by                  uuid,
    UNIQUE (tenant_id, supplier_code)
);
CREATE INDEX ix_suppliers_tenant ON suppliers(tenant_id) WHERE is_deleted = false;

-- ============================================================================
-- SECTION 5: SALES
-- ============================================================================

CREATE TABLE invoices (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_number               varchar(50) NOT NULL,
    invoice_date                 date NOT NULL DEFAULT CURRENT_DATE,
    due_date                    date,
    customer_id                 uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    warehouse_id                uuid REFERENCES warehouses(id) ON DELETE SET NULL,
    subtotal                    numeric(14,2) NOT NULL DEFAULT 0,
    discount_percent             numeric(5,2) NOT NULL DEFAULT 0,
    discount_amount              numeric(14,2) NOT NULL DEFAULT 0,
    cgst_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    sgst_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    igst_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    round_off                    numeric(6,2) NOT NULL DEFAULT 0,
    grand_total                  numeric(14,2) NOT NULL DEFAULT 0,
    paid_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    balance_amount               numeric(14,2) NOT NULL DEFAULT 0,
    payment_method               varchar(20) NOT NULL DEFAULT 'Cash'
                                    CHECK (payment_method IN ('Cash','UPI','Bank','Card','Credit')),
    status                      varchar(20) NOT NULL DEFAULT 'Draft'
                                    CHECK (status IN ('Draft','Pending','PartiallyPaid','Paid','Cancelled')),
    notes                       text,
    terms                       text,
    print_count                  integer NOT NULL DEFAULT 0,
    is_deleted                  boolean NOT NULL DEFAULT false,
    version                     integer NOT NULL DEFAULT 1,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now(),
    created_by                  uuid,
    updated_by                  uuid,
    UNIQUE (tenant_id, invoice_number)
);
CREATE INDEX ix_invoices_tenant_date ON invoices(tenant_id, invoice_date DESC) WHERE is_deleted = false;
CREATE INDEX ix_invoices_customer ON invoices(customer_id);
CREATE INDEX ix_invoices_status ON invoices(tenant_id, status);

CREATE TABLE invoice_items (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id                  uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id                  uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    batch_id                    uuid REFERENCES product_batches(id) ON DELETE SET NULL,
    description                 varchar(255),
    quantity                    numeric(14,3) NOT NULL,
    unit_price                   numeric(14,2) NOT NULL,
    discount_percent             numeric(5,2) NOT NULL DEFAULT 0,
    discount_amount              numeric(14,2) NOT NULL DEFAULT 0,
    gst_percent                  numeric(5,2) NOT NULL DEFAULT 0,
    cgst_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    sgst_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    igst_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    total_amount                 numeric(14,2) NOT NULL
);
CREATE INDEX ix_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX ix_invoice_items_product ON invoice_items(product_id);

CREATE TABLE quotations (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    quotation_number             varchar(50) NOT NULL,
    quotation_date               date NOT NULL DEFAULT CURRENT_DATE,
    expiry_date                  date,
    customer_id                 uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    subtotal                    numeric(14,2) NOT NULL DEFAULT 0,
    discount_amount              numeric(14,2) NOT NULL DEFAULT 0,
    cgst_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    sgst_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    igst_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    round_off                    numeric(6,2) NOT NULL DEFAULT 0,
    grand_total                  numeric(14,2) NOT NULL DEFAULT 0,
    status                      varchar(20) NOT NULL DEFAULT 'Draft'
                                    CHECK (status IN ('Draft','Sent','Accepted','Rejected','Expired','Converted')),
    converted_invoice_id          uuid REFERENCES invoices(id) ON DELETE SET NULL,
    notes                       text,
    terms                       text,
    is_deleted                  boolean NOT NULL DEFAULT false,
    version                     integer NOT NULL DEFAULT 1,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now(),
    created_by                  uuid,
    updated_by                  uuid,
    UNIQUE (tenant_id, quotation_number),
    UNIQUE (converted_invoice_id)
);
CREATE INDEX ix_quotations_tenant_date ON quotations(tenant_id, quotation_date DESC) WHERE is_deleted = false;
CREATE INDEX ix_quotations_status ON quotations(tenant_id, status);

CREATE TABLE quotation_items (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id                 uuid NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id                  uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    description                 varchar(255),
    quantity                    numeric(14,3) NOT NULL,
    unit_price                   numeric(14,2) NOT NULL,
    discount_percent             numeric(5,2) NOT NULL DEFAULT 0,
    discount_amount              numeric(14,2) NOT NULL DEFAULT 0,
    gst_percent                  numeric(5,2) NOT NULL DEFAULT 0,
    cgst_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    sgst_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    igst_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    total_amount                 numeric(14,2) NOT NULL
);
CREATE INDEX ix_quotation_items_quotation ON quotation_items(quotation_id);

CREATE TABLE sales_returns (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    return_number                varchar(50) NOT NULL,
    return_date                  date NOT NULL DEFAULT CURRENT_DATE,
    invoice_id                  uuid NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    customer_id                  uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    subtotal                    numeric(14,2) NOT NULL DEFAULT 0,
    gst_amount                   numeric(14,2) NOT NULL DEFAULT 0,
    grand_total                  numeric(14,2) NOT NULL DEFAULT 0,
    reason                      text,
    status                      varchar(20) NOT NULL DEFAULT 'Completed'
                                    CHECK (status IN ('Draft','Completed','Cancelled')),
    is_deleted                  boolean NOT NULL DEFAULT false,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now(),
    created_by                  uuid,
    UNIQUE (tenant_id, return_number)
);
CREATE INDEX ix_sales_returns_invoice ON sales_returns(invoice_id);

CREATE TABLE sales_return_items (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_return_id               uuid NOT NULL REFERENCES sales_returns(id) ON DELETE CASCADE,
    invoice_item_id               uuid NOT NULL REFERENCES invoice_items(id) ON DELETE RESTRICT,
    product_id                  uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity                    numeric(14,3) NOT NULL,
    unit_price                   numeric(14,2) NOT NULL,
    total_amount                 numeric(14,2) NOT NULL
);

-- ============================================================================
-- SECTION 6: PURCHASING
-- ============================================================================

CREATE TABLE purchases (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    purchase_number              varchar(50) NOT NULL,
    purchase_date                date NOT NULL DEFAULT CURRENT_DATE,
    supplier_id                  uuid NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    warehouse_id                uuid REFERENCES warehouses(id) ON DELETE SET NULL,
    reference_bill_number         varchar(100),
    subtotal                    numeric(14,2) NOT NULL DEFAULT 0,
    discount_amount              numeric(14,2) NOT NULL DEFAULT 0,
    cgst_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    sgst_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    igst_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    round_off                    numeric(6,2) NOT NULL DEFAULT 0,
    grand_total                  numeric(14,2) NOT NULL DEFAULT 0,
    paid_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    balance_amount               numeric(14,2) NOT NULL DEFAULT 0,
    status                      varchar(20) NOT NULL DEFAULT 'Draft'
                                    CHECK (status IN ('Draft','Received','Cancelled')),
    notes                       text,
    is_deleted                  boolean NOT NULL DEFAULT false,
    version                     integer NOT NULL DEFAULT 1,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now(),
    created_by                  uuid,
    updated_by                  uuid,
    UNIQUE (tenant_id, purchase_number)
);
CREATE INDEX ix_purchases_tenant_date ON purchases(tenant_id, purchase_date DESC) WHERE is_deleted = false;
CREATE INDEX ix_purchases_supplier ON purchases(supplier_id);

CREATE TABLE purchase_items (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id                  uuid NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    product_id                  uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity                    numeric(14,3) NOT NULL,
    unit_price                   numeric(14,2) NOT NULL,
    discount_percent             numeric(5,2) NOT NULL DEFAULT 0,
    gst_percent                  numeric(5,2) NOT NULL DEFAULT 0,
    cgst_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    sgst_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    igst_amount                  numeric(14,2) NOT NULL DEFAULT 0,
    total_amount                 numeric(14,2) NOT NULL,
    batch_number                 varchar(100),
    expiry_date                  date
);
CREATE INDEX ix_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX ix_purchase_items_product ON purchase_items(product_id);

CREATE TABLE purchase_returns (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    return_number                varchar(50) NOT NULL,
    return_date                  date NOT NULL DEFAULT CURRENT_DATE,
    purchase_id                  uuid NOT NULL REFERENCES purchases(id) ON DELETE RESTRICT,
    supplier_id                  uuid NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    subtotal                    numeric(14,2) NOT NULL DEFAULT 0,
    gst_amount                   numeric(14,2) NOT NULL DEFAULT 0,
    grand_total                  numeric(14,2) NOT NULL DEFAULT 0,
    reason                      text,
    status                      varchar(20) NOT NULL DEFAULT 'Completed'
                                    CHECK (status IN ('Draft','Completed','Cancelled')),
    is_deleted                  boolean NOT NULL DEFAULT false,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    created_by                  uuid,
    UNIQUE (tenant_id, return_number)
);
CREATE INDEX ix_purchase_returns_purchase ON purchase_returns(purchase_id);

CREATE TABLE purchase_return_items (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_return_id            uuid NOT NULL REFERENCES purchase_returns(id) ON DELETE CASCADE,
    purchase_item_id              uuid NOT NULL REFERENCES purchase_items(id) ON DELETE RESTRICT,
    product_id                  uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity                    numeric(14,3) NOT NULL,
    unit_price                   numeric(14,2) NOT NULL,
    total_amount                 numeric(14,2) NOT NULL
);

-- ============================================================================
-- SECTION 7: INVENTORY
-- ============================================================================

CREATE TABLE stock_ledger_entries (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id                  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id                uuid REFERENCES warehouses(id) ON DELETE SET NULL,
    batch_id                    uuid REFERENCES product_batches(id) ON DELETE SET NULL,
    transaction_type              varchar(30) NOT NULL
                                    CHECK (transaction_type IN
                                        ('OpeningStock','Purchase','Sale','PurchaseReturn','SalesReturn','Adjustment')),
    reference_type                varchar(30), -- 'Invoice','Purchase','SalesReturn','PurchaseReturn','StockAdjustment'
    reference_id                 uuid,
    quantity_in                  numeric(14,3) NOT NULL DEFAULT 0,
    quantity_out                 numeric(14,3) NOT NULL DEFAULT 0,
    balance_after                numeric(14,3) NOT NULL,
    unit_cost                    numeric(14,2),
    notes                       text,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    created_by                  uuid
);
CREATE INDEX ix_stock_ledger_product ON stock_ledger_entries(product_id, created_at DESC);
CREATE INDEX ix_stock_ledger_reference ON stock_ledger_entries(reference_type, reference_id);
CREATE INDEX ix_stock_ledger_tenant ON stock_ledger_entries(tenant_id, created_at DESC);

CREATE TABLE stock_adjustments (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    adjustment_number             varchar(50) NOT NULL,
    adjustment_date               date NOT NULL DEFAULT CURRENT_DATE,
    warehouse_id                uuid REFERENCES warehouses(id) ON DELETE SET NULL,
    reason                      varchar(255),
    notes                       text,
    status                      varchar(20) NOT NULL DEFAULT 'Completed'
                                    CHECK (status IN ('Draft','Completed')),
    is_deleted                  boolean NOT NULL DEFAULT false,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    created_by                  uuid,
    UNIQUE (tenant_id, adjustment_number)
);

CREATE TABLE stock_adjustment_items (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_adjustment_id           uuid NOT NULL REFERENCES stock_adjustments(id) ON DELETE CASCADE,
    product_id                  uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    batch_id                    uuid REFERENCES product_batches(id) ON DELETE SET NULL,
    system_quantity               numeric(14,3) NOT NULL,
    actual_quantity               numeric(14,3) NOT NULL,
    difference_quantity           numeric(14,3) GENERATED ALWAYS AS (actual_quantity - system_quantity) STORED
);

-- ============================================================================
-- SECTION 8: FINANCE
-- ============================================================================

CREATE TABLE expense_categories (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name                        varchar(150) NOT NULL,
    is_active                   boolean NOT NULL DEFAULT true,
    UNIQUE (tenant_id, name)
);

CREATE TABLE expenses (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    expense_category_id           uuid NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
    amount                      numeric(14,2) NOT NULL,
    expense_date                 date NOT NULL DEFAULT CURRENT_DATE,
    payment_method               varchar(20) NOT NULL DEFAULT 'Cash'
                                    CHECK (payment_method IN ('Cash','UPI','Bank','Card')),
    reference_number              varchar(100),
    notes                       text,
    attachment_url                text,
    is_deleted                  boolean NOT NULL DEFAULT false,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    created_by                  uuid
);
CREATE INDEX ix_expenses_tenant_date ON expenses(tenant_id, expense_date DESC) WHERE is_deleted = false;

CREATE TABLE income_categories (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name                        varchar(150) NOT NULL,
    is_active                   boolean NOT NULL DEFAULT true,
    UNIQUE (tenant_id, name)
);

CREATE TABLE incomes (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    income_category_id            uuid NOT NULL REFERENCES income_categories(id) ON DELETE RESTRICT,
    amount                      numeric(14,2) NOT NULL,
    income_date                  date NOT NULL DEFAULT CURRENT_DATE,
    source                      varchar(150),
    payment_method               varchar(20) NOT NULL DEFAULT 'Cash'
                                    CHECK (payment_method IN ('Cash','UPI','Bank','Card')),
    notes                       text,
    is_deleted                  boolean NOT NULL DEFAULT false,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    created_by                  uuid
);
CREATE INDEX ix_incomes_tenant_date ON incomes(tenant_id, income_date DESC) WHERE is_deleted = false;

CREATE TABLE payments (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    payment_number                varchar(50) NOT NULL,
    payment_date                 date NOT NULL DEFAULT CURRENT_DATE,
    supplier_id                  uuid REFERENCES suppliers(id) ON DELETE RESTRICT,
    purchase_id                  uuid REFERENCES purchases(id) ON DELETE SET NULL,
    amount                      numeric(14,2) NOT NULL,
    payment_method               varchar(20) NOT NULL DEFAULT 'Cash'
                                    CHECK (payment_method IN ('Cash','UPI','Bank','Card')),
    reference_number              varchar(100),
    notes                       text,
    is_deleted                  boolean NOT NULL DEFAULT false,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    created_by                  uuid,
    UNIQUE (tenant_id, payment_number)
);
CREATE INDEX ix_payments_supplier ON payments(supplier_id);

CREATE TABLE receipts (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    receipt_number                varchar(50) NOT NULL,
    receipt_date                 date NOT NULL DEFAULT CURRENT_DATE,
    customer_id                  uuid REFERENCES customers(id) ON DELETE RESTRICT,
    invoice_id                   uuid REFERENCES invoices(id) ON DELETE SET NULL,
    amount                      numeric(14,2) NOT NULL,
    payment_method               varchar(20) NOT NULL DEFAULT 'Cash'
                                    CHECK (payment_method IN ('Cash','UPI','Bank','Card')),
    reference_number              varchar(100),
    notes                       text,
    is_deleted                  boolean NOT NULL DEFAULT false,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    created_by                  uuid,
    UNIQUE (tenant_id, receipt_number)
);
CREATE INDEX ix_receipts_customer ON receipts(customer_id);

-- ============================================================================
-- SECTION 9: SETTINGS
-- ============================================================================

CREATE TABLE printer_settings (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    paper_size                  varchar(20) NOT NULL DEFAULT 'A4'
                                    CHECK (paper_size IN ('A4','Thermal80','Thermal58','Letter')),
    orientation                  varchar(10) NOT NULL DEFAULT 'Portrait'
                                    CHECK (orientation IN ('Portrait','Landscape')),
    template_style                varchar(20) NOT NULL DEFAULT 'Modern'
                                    CHECK (template_style IN ('Modern','Minimal','Professional','Dark')),
    show_logo                    boolean NOT NULL DEFAULT true,
    show_qr                      boolean NOT NULL DEFAULT true,
    show_barcode                  boolean NOT NULL DEFAULT false,
    show_signature                boolean NOT NULL DEFAULT true,
    show_terms                   boolean NOT NULL DEFAULT true,
    show_gst_breakdown             boolean NOT NULL DEFAULT true,
    header_text                  text,
    footer_text                  text,
    is_default                   boolean NOT NULL DEFAULT true,
    UNIQUE (tenant_id, paper_size, template_style)
);

-- ============================================================================
-- Done. See database/seed.sql for Super Admin bootstrap + default subscription plans.
-- ============================================================================
