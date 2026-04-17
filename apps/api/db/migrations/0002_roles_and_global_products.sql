-- WhatsMenu — Roles (admin/owner) and Global Products
-- Adds a unified users table and a global_products catalog for the platform admin.

begin;

-- ============================================================
-- USERS (unified identity — replaces platform_admins for auth)
-- ============================================================
create table users (
    id          uuid primary key default gen_random_uuid(),
    phone       text not null unique,
    name        text not null,
    email       text,
    role        text not null default 'owner'
                check (role in ('admin', 'owner')),
    tenant_id   uuid references tenants(id) on delete set null,
    created_at  timestamptz not null default now()
);
create index idx_users_tenant on users(tenant_id);
create index idx_users_phone on users(phone);

-- Migrate existing platform_admins into users with role='admin'
insert into users (id, phone, name, email, role)
select id, phone, name, email, 'admin'
from platform_admins;

-- ============================================================
-- GLOBAL PRODUCTS (platform-wide catalog managed by admin)
-- ============================================================
create table global_products (
    id          uuid primary key default gen_random_uuid(),
    name        text not null,
    description text,
    image_url   text,
    category    text not null,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create trigger trg_global_products_updated_at
    before update on global_products
    for each row execute function set_updated_at();

-- Track which global product was cloned to a tenant product
alter table products
    add column global_product_id uuid references global_products(id) on delete set null;

commit;
