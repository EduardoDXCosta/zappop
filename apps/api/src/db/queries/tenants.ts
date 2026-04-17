import { sql } from '../connection.js';
import type { Tenant, TenantHours, TenantException } from '../types.js';

type TenantRow = {
    id: string;
    slug: string;
    name: string;
    cpf: string | null;
    cnpj: string | null;
    logoUrl: string | null;
    acceptsCard: boolean;
    cardBrands: string[];
    acceptsVoucher: boolean;
    voucherBrands: string[];
    issuesNfCpf: boolean;
    pixKey: string | null;
    aiProvider: Tenant['aiProvider'];
    aiApiKeyEncrypted: string | null;
    plan: Tenant['plan'];
    planStatus: Tenant['planStatus'];
    vacationMode: boolean;
    waitingTimeMinutes: number;
    whatsappCustomerNumber: string | null;
    whatsappAdminNumber: string | null;
    addrStreet: string | null;
    addrNumber: string | null;
    addrNeighborhood: string | null;
    addrZip: string | null;
    addrCity: string | null;
    addrState: string | null;
    addrLat: string | null;
    addrLng: string | null;
    deliveryEnabled: boolean;
    deliveryFee: string;
    deliveryFarNeighborhoods: boolean;
    deliveryRadiusKm: number | null;
    deliveryNeighborhoods: string[];
};

// Why: postgres numeric arrives as string â€” normalize to number here.
function mapTenant(row: TenantRow): Tenant {
    return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        cpf: row.cpf,
        cnpj: row.cnpj,
        logoUrl: row.logoUrl,
        acceptsCard: row.acceptsCard,
        cardBrands: row.cardBrands,
        acceptsVoucher: row.acceptsVoucher,
        voucherBrands: row.voucherBrands,
        issuesNfCpf: row.issuesNfCpf,
        pixKey: row.pixKey,
        aiProvider: row.aiProvider,
        aiApiKeyEncrypted: row.aiApiKeyEncrypted,
        plan: row.plan,
        planStatus: row.planStatus,
        vacationMode: row.vacationMode,
        waitingTimeMinutes: row.waitingTimeMinutes,
        whatsappCustomerNumber: row.whatsappCustomerNumber,
        whatsappAdminNumber: row.whatsappAdminNumber,
        addrStreet: row.addrStreet,
        addrNumber: row.addrNumber,
        addrNeighborhood: row.addrNeighborhood,
        addrZip: row.addrZip,
        addrCity: row.addrCity,
        addrState: row.addrState,
        addrLat: row.addrLat === null ? null : Number(row.addrLat),
        addrLng: row.addrLng === null ? null : Number(row.addrLng),
        deliveryEnabled: row.deliveryEnabled,
        deliveryFee: Number(row.deliveryFee),
        deliveryFarNeighborhoods: row.deliveryFarNeighborhoods,
        deliveryRadiusKm: row.deliveryRadiusKm,
        deliveryNeighborhoods: row.deliveryNeighborhoods,
    };
}

const tenantSelect = sql`
    id,
    slug,
    name,
    cpf,
    cnpj,
    logo_url             as "logoUrl",
    accepts_card         as "acceptsCard",
    card_brands          as "cardBrands",
    accepts_voucher      as "acceptsVoucher",
    voucher_brands       as "voucherBrands",
    issues_nf_cpf        as "issuesNfCpf",
    pix_key              as "pixKey",
    ai_provider          as "aiProvider",
    ai_api_key_encrypted as "aiApiKeyEncrypted",
    plan,
    plan_status          as "planStatus",
    vacation_mode        as "vacationMode",
    waiting_time_minutes as "waitingTimeMinutes",
    whatsapp_customer_number as "whatsappCustomerNumber",
    whatsapp_admin_number    as "whatsappAdminNumber",
    addr_street          as "addrStreet",
    addr_number          as "addrNumber",
    addr_neighborhood    as "addrNeighborhood",
    addr_zip             as "addrZip",
    addr_city            as "addrCity",
    addr_state           as "addrState",
    addr_lat             as "addrLat",
    addr_lng             as "addrLng",
    delivery_enabled     as "deliveryEnabled",
    delivery_fee         as "deliveryFee",
    delivery_far_neighborhoods as "deliveryFarNeighborhoods",
    delivery_radius_km   as "deliveryRadiusKm",
    delivery_neighborhoods as "deliveryNeighborhoods"
`;

export async function getTenantById(id: string): Promise<Tenant | null> {
    const rows = await sql<TenantRow[]>`
        select ${tenantSelect} from tenants where id = ${id} limit 1
    `;
    return rows[0] ? mapTenant(rows[0]) : null;
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
    const rows = await sql<TenantRow[]>`
        select ${tenantSelect} from tenants where slug = ${slug} limit 1
    `;
    return rows[0] ? mapTenant(rows[0]) : null;
}

export async function createTenant(input: {
    slug: string;
    name: string;
    cpf?: string;
    cnpj?: string;
    logoUrl?: string;
    whatsappCustomerNumber?: string;
    whatsappAdminNumber?: string;
    addrStreet?: string;
    addrNumber?: string;
    addrNeighborhood?: string;
    addrZip?: string;
    addrCity?: string;
    addrState?: string;
    deliveryEnabled?: boolean;
    deliveryFee?: number;
    deliveryFarNeighborhoods?: boolean;
    deliveryNeighborhoods?: string[];
    waitingTimeMinutes?: number;
    acceptsCard?: boolean;
    cardBrands?: string[];
    acceptsVoucher?: boolean;
    voucherBrands?: string[];
    issuesNfCpf?: boolean;
    pixKey?: string;
}): Promise<Tenant> {
    const rows = await sql<TenantRow[]>`
        insert into tenants (
            slug,
            name,
            cpf,
            cnpj,
            logo_url,
            whatsapp_customer_number,
            whatsapp_admin_number,
            addr_street,
            addr_number,
            addr_neighborhood,
            addr_zip,
            addr_city,
            addr_state,
            delivery_enabled,
            delivery_fee,
            delivery_far_neighborhoods,
            delivery_neighborhoods,
            waiting_time_minutes,
            accepts_card,
            card_brands,
            accepts_voucher,
            voucher_brands,
            issues_nf_cpf,
            pix_key
        )
        values (
            ${input.slug},
            ${input.name},
            ${input.cpf ?? null},
            ${input.cnpj ?? null},
            ${input.logoUrl ?? null},
            ${input.whatsappCustomerNumber ?? null},
            ${input.whatsappAdminNumber ?? null},
            ${input.addrStreet ?? null},
            ${input.addrNumber ?? null},
            ${input.addrNeighborhood ?? null},
            ${input.addrZip ?? null},
            ${input.addrCity ?? null},
            ${input.addrState ?? null},
            ${input.deliveryEnabled ?? true},
            ${input.deliveryFee ?? 0},
            ${input.deliveryFarNeighborhoods ?? false},
            ${input.deliveryNeighborhoods ?? []},
            ${input.waitingTimeMinutes ?? 30},
            ${input.acceptsCard ?? false},
            ${input.cardBrands ?? []},
            ${input.acceptsVoucher ?? false},
            ${input.voucherBrands ?? []},
            ${input.issuesNfCpf ?? false},
            ${input.pixKey ?? null}
        )
        returning ${tenantSelect}
    `;
    return mapTenant(rows[0]);
}

export async function replaceTenantHours(input: {
    tenantId: string;
    hours: Array<{
        dayOfWeek: number;
        opensAt: string;
        closesAt: string;
        shift?: number;
    }>;
}): Promise<void> {
    await sql.begin(async (tx) => {
        await tx`
            delete from tenant_hours
            where tenant_id = ${input.tenantId}
        `;

        for (const item of input.hours) {
            await tx`
                insert into tenant_hours (
                    tenant_id,
                    day_of_week,
                    shift,
                    opens_at,
                    closes_at
                )
                values (
                    ${input.tenantId},
                    ${item.dayOfWeek},
                    ${item.shift ?? 1},
                    ${item.opensAt},
                    ${item.closesAt}
                )
            `;
        }
    });
}

export async function getDefaultTenantForApp(): Promise<Tenant | null> {
    const preferredSlug = process.env.APP_DEFAULT_TENANT_SLUG?.trim();
    if (preferredSlug) {
        return getTenantBySlug(preferredSlug);
    }

    const rows = await sql<TenantRow[]>`
        select ${tenantSelect}
        from tenants
        order by created_at asc
        limit 1
    `;
    return rows[0] ? mapTenant(rows[0]) : null;
}

export async function getTenantByWhatsAppNumber(
    number: string
): Promise<{ tenant: Tenant; role: 'customer' | 'admin' } | null> {
    const rows = await sql<TenantRow[]>`
        select ${tenantSelect}
        from tenants
        where whatsapp_customer_number = ${number}
           or whatsapp_admin_number = ${number}
        limit 1
    `;
    const row = rows[0];
    if (!row) return null;
    const tenant = mapTenant(row);
    const role: 'customer' | 'admin' =
        tenant.whatsappAdminNumber === number ? 'admin' : 'customer';
    return { tenant, role };
}

export async function getTenantHours(
    tenantId: string
): Promise<TenantHours[]> {
    const rows = await sql<
        {
            id: string;
            tenantId: string;
            dayOfWeek: number;
            shift: number;
            opensAt: string;
            closesAt: string;
        }[]
    >`
        select
            id,
            tenant_id   as "tenantId",
            day_of_week as "dayOfWeek",
            shift,
            to_char(opens_at, 'HH24:MI:SS')  as "opensAt",
            to_char(closes_at, 'HH24:MI:SS') as "closesAt"
        from tenant_hours
        where tenant_id = ${tenantId}
        order by day_of_week asc, shift asc
    `;
    return rows;
}

export async function getAllTenants(): Promise<Tenant[]> {
    const rows = await sql<TenantRow[]>`
        select ${tenantSelect} from tenants order by created_at desc
    `;
    return rows.map(mapTenant);
}

export async function getTenantExceptions(
    tenantId: string,
    fromDate: string,
    toDate: string
): Promise<TenantException[]> {
    const rows = await sql<
        {
            id: string;
            tenantId: string;
            date: Date;
            closed: boolean;
            note: string | null;
        }[]
    >`
        select
            id,
            tenant_id as "tenantId",
            date,
            closed,
            note
        from tenant_exceptions
        where tenant_id = ${tenantId}
          and date >= ${fromDate}
          and date <= ${toDate}
        order by date asc
    `;
    return rows.map((r) => ({
        id: r.id,
        tenantId: r.tenantId,
        date:
            r.date instanceof Date
                ? r.date.toISOString().slice(0, 10)
                : String(r.date),
        closed: r.closed,
        note: r.note,
    }));
}
