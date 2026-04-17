-- WhatsMenu — Initial schema
-- Follows Postgres best practices: lowercase snake_case identifiers,
-- uuid primary keys, timestamptz, numeric for money, FK indexes.

begin;

create extension if not exists "pgcrypto";

-- ============================================================
-- TENANTS (restaurants — each SaaS customer)
-- ============================================================
create table tenants (
    id              uuid primary key default gen_random_uuid(),
    slug            text not null unique,
    name            text not null,
    cpf             text,
    cnpj            text,
    logo_url        text,

    accepts_card            boolean not null default false,
    card_brands             text[] not null default '{}',
    accepts_voucher         boolean not null default false,
    voucher_brands          text[] not null default '{}',
    issues_nf_cpf           boolean not null default false,
    pix_key                 text,

    addr_street             text,
    addr_number             text,
    addr_neighborhood       text,
    addr_zip                text,
    addr_city               text,
    addr_state              text,
    addr_lat                numeric(10, 7),
    addr_lng                numeric(10, 7),

    delivery_enabled            boolean not null default true,
    delivery_fee                numeric(10, 2) not null default 0,
    delivery_far_neighborhoods  boolean not null default false,
    delivery_radius_km          integer,
    delivery_neighborhoods      text[] not null default '{}',

    waiting_time_minutes    integer not null default 30,
    vacation_mode           boolean not null default false,

    whatsapp_customer_number    text,
    whatsapp_admin_number       text,

    ai_provider             text not null default 'claude'
                            check (ai_provider in ('claude', 'gpt', 'gemini')),
    ai_api_key_encrypted    text,

    plan                    text not null default 'start'
                            check (plan in ('start', 'advanced', 'premium')),
    plan_status             text not null default 'trial'
                            check (plan_status in ('trial', 'active', 'past_due', 'blocked', 'cancelled')),
    trial_ends_at           timestamptz,

    created_at              timestamptz not null default now(),
    updated_at              timestamptz not null default now()
);

-- ============================================================
-- TENANT OPERATING HOURS (supports 2 shifts per day)
-- ============================================================
create table tenant_hours (
    id              uuid primary key default gen_random_uuid(),
    tenant_id       uuid not null references tenants(id) on delete cascade,
    day_of_week     smallint not null check (day_of_week between 0 and 6),
    shift           smallint not null default 1 check (shift in (1, 2)),
    opens_at        time not null,
    closes_at       time not null,
    unique (tenant_id, day_of_week, shift)
);
create index idx_tenant_hours_tenant on tenant_hours(tenant_id);

-- ============================================================
-- TENANT EXCEPTIONS (holidays, vacations)
-- ============================================================
create table tenant_exceptions (
    id              uuid primary key default gen_random_uuid(),
    tenant_id       uuid not null references tenants(id) on delete cascade,
    date            date not null,
    closed          boolean not null default true,
    note            text,
    unique (tenant_id, date)
);
create index idx_tenant_exceptions_tenant on tenant_exceptions(tenant_id);

-- ============================================================
-- MENU — categories and products
-- ============================================================
create table categories (
    id              uuid primary key default gen_random_uuid(),
    tenant_id       uuid not null references tenants(id) on delete cascade,
    name            text not null,
    sort_order      integer not null default 0,
    active          boolean not null default true,
    created_at      timestamptz not null default now()
);
create index idx_categories_tenant on categories(tenant_id);

create table products (
    id              uuid primary key default gen_random_uuid(),
    tenant_id       uuid not null references tenants(id) on delete cascade,
    category_id     uuid references categories(id) on delete set null,
    name            text not null,
    description     text,
    price           numeric(10, 2) not null check (price >= 0),
    image_url       text,
    available       boolean not null default true,
    menu_type       text not null default 'fixed'
                    check (menu_type in ('fixed', 'daily')),
    available_on    date,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);
create index idx_products_tenant on products(tenant_id);
create index idx_products_category on products(category_id);
create index idx_products_daily on products(tenant_id, available_on)
    where menu_type = 'daily';

create table product_addons (
    id              uuid primary key default gen_random_uuid(),
    product_id      uuid not null references products(id) on delete cascade,
    name            text not null,
    price           numeric(10, 2) not null default 0 check (price >= 0),
    required        boolean not null default false,
    max_quantity    integer not null default 1 check (max_quantity >= 1),
    sort_order      integer not null default 0
);
create index idx_product_addons_product on product_addons(product_id);

-- ============================================================
-- CUSTOMERS (end customers of each restaurant)
-- ============================================================
create table customers (
    id              uuid primary key default gen_random_uuid(),
    tenant_id       uuid not null references tenants(id) on delete cascade,
    phone           text not null,
    name            text,
    notes           text,
    blocked         boolean not null default false,
    block_reason    text,
    last_order_at   timestamptz,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    unique (tenant_id, phone)
);
create index idx_customers_tenant on customers(tenant_id);

create table customer_addresses (
    id              uuid primary key default gen_random_uuid(),
    customer_id     uuid not null references customers(id) on delete cascade,
    label           text,
    street          text not null,
    number          text,
    complement      text,
    neighborhood    text,
    zip             text,
    city            text,
    state           text,
    reference_point text,
    is_default      boolean not null default false,
    created_at      timestamptz not null default now()
);
create index idx_customer_addresses_customer on customer_addresses(customer_id);

-- ============================================================
-- CONVERSATIONS (agent memory per customer)
-- ============================================================
create table conversations (
    id              uuid primary key default gen_random_uuid(),
    tenant_id       uuid not null references tenants(id) on delete cascade,
    customer_id     uuid not null references customers(id) on delete cascade,
    role            text not null check (role in ('user', 'assistant', 'system', 'tool')),
    content         text not null,
    metadata        jsonb,
    created_at      timestamptz not null default now()
);
create index idx_conversations_customer_created
    on conversations(customer_id, created_at desc);
create index idx_conversations_tenant on conversations(tenant_id);

-- ============================================================
-- ORDERS
-- ============================================================
create table orders (
    id                      uuid primary key default gen_random_uuid(),
    tenant_id               uuid not null references tenants(id) on delete restrict,
    customer_id             uuid not null references customers(id) on delete restrict,
    address_id              uuid references customer_addresses(id) on delete set null,

    status                  text not null default 'aguardando'
                            check (status in ('aguardando', 'aceito', 'em_preparo',
                                              'saiu_entrega', 'entregue', 'cancelado')),
    type                    text not null default 'delivery'
                            check (type in ('delivery', 'pickup')),

    subtotal                numeric(10, 2) not null default 0 check (subtotal >= 0),
    delivery_fee            numeric(10, 2) not null default 0 check (delivery_fee >= 0),
    discount                numeric(10, 2) not null default 0 check (discount >= 0),
    total                   numeric(10, 2) not null default 0 check (total >= 0),

    payment_method          text check (payment_method in ('pix', 'card', 'cash')),
    card_brand              text,
    change_for              numeric(10, 2),

    waiting_time_minutes    integer,
    notes                   text,

    created_at              timestamptz not null default now(),
    updated_at              timestamptz not null default now(),
    delivered_at            timestamptz,
    cancelled_at            timestamptz
);
create index idx_orders_tenant_status_created
    on orders(tenant_id, status, created_at desc);
create index idx_orders_customer on orders(customer_id);
create index idx_orders_address on orders(address_id);

create table order_items (
    id              uuid primary key default gen_random_uuid(),
    order_id        uuid not null references orders(id) on delete cascade,
    product_id      uuid not null references products(id) on delete restrict,
    product_name    text not null,
    quantity        integer not null check (quantity > 0),
    unit_price      numeric(10, 2) not null check (unit_price >= 0),
    subtotal        numeric(10, 2) not null check (subtotal >= 0),
    notes           text
);
create index idx_order_items_order on order_items(order_id);
create index idx_order_items_product on order_items(product_id);

create table order_item_addons (
    id              uuid primary key default gen_random_uuid(),
    order_item_id   uuid not null references order_items(id) on delete cascade,
    addon_id        uuid references product_addons(id) on delete set null,
    name            text not null,
    price           numeric(10, 2) not null default 0
);
create index idx_order_item_addons_item on order_item_addons(order_item_id);

-- ============================================================
-- PROMOTIONS, COUPONS, LOYALTY
-- ============================================================
create table promotions (
    id              uuid primary key default gen_random_uuid(),
    tenant_id       uuid not null references tenants(id) on delete cascade,
    name            text not null,
    description     text,
    kind            text not null check (kind in ('schedule', 'weekday', 'combo')),
    discount_type   text not null check (discount_type in ('percent', 'fixed', 'free_delivery')),
    value           numeric(10, 2) not null default 0,
    days_of_week    smallint[] not null default '{}',
    start_time      time,
    end_time        time,
    starts_at       timestamptz,
    ends_at         timestamptz,
    active          boolean not null default true,
    created_at      timestamptz not null default now()
);
create index idx_promotions_tenant on promotions(tenant_id);

create table coupons (
    id              uuid primary key default gen_random_uuid(),
    tenant_id       uuid not null references tenants(id) on delete cascade,
    code            text not null,
    discount_type   text not null check (discount_type in ('percent', 'fixed', 'free_delivery')),
    value           numeric(10, 2) not null default 0,
    max_uses        integer,
    used_count      integer not null default 0,
    expires_at      timestamptz,
    active          boolean not null default true,
    created_at      timestamptz not null default now(),
    unique (tenant_id, code)
);
create index idx_coupons_tenant on coupons(tenant_id);

create table loyalty_config (
    tenant_id           uuid primary key references tenants(id) on delete cascade,
    orders_needed       integer not null check (orders_needed > 0),
    reward_description  text not null,
    active              boolean not null default true
);

create table loyalty_progress (
    id              uuid primary key default gen_random_uuid(),
    customer_id     uuid not null references customers(id) on delete cascade,
    orders_count    integer not null default 0,
    rewards_earned  integer not null default 0,
    unique (customer_id)
);

-- ============================================================
-- RATINGS
-- ============================================================
create table ratings (
    id              uuid primary key default gen_random_uuid(),
    order_id        uuid not null references orders(id) on delete cascade,
    customer_id     uuid not null references customers(id) on delete cascade,
    tenant_id       uuid not null references tenants(id) on delete cascade,
    score           smallint not null check (score between 1 and 5),
    comment         text,
    created_at      timestamptz not null default now(),
    unique (order_id)
);
create index idx_ratings_tenant on ratings(tenant_id);
create index idx_ratings_customer on ratings(customer_id);

-- ============================================================
-- PLATFORM ADMINS & SUPPORT REQUESTS
-- ============================================================
create table platform_admins (
    id              uuid primary key default gen_random_uuid(),
    name            text not null,
    phone           text not null unique,
    email           text unique,
    created_at      timestamptz not null default now()
);

create table support_requests (
    id              uuid primary key default gen_random_uuid(),
    tenant_id       uuid references tenants(id) on delete set null,
    subject         text,
    message         text not null,
    status          text not null default 'open'
                    check (status in ('open', 'in_progress', 'resolved')),
    created_at      timestamptz not null default now(),
    resolved_at     timestamptz
);
create index idx_support_requests_tenant on support_requests(tenant_id);

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger trg_tenants_updated_at
    before update on tenants
    for each row execute function set_updated_at();

create trigger trg_products_updated_at
    before update on products
    for each row execute function set_updated_at();

create trigger trg_customers_updated_at
    before update on customers
    for each row execute function set_updated_at();

create trigger trg_orders_updated_at
    before update on orders
    for each row execute function set_updated_at();

commit;
