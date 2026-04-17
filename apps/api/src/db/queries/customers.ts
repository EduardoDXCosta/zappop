import { sql } from '../connection.js';
import type { Customer, CustomerAddress } from '../types.js';

type CustomerRow = {
    id: string;
    tenantId: string;
    phone: string;
    name: string | null;
    notes: string | null;
    blocked: boolean;
    blockReason: string | null;
    lastOrderAt: Date | null;
};

function mapCustomer(row: CustomerRow): Customer {
    return {
        id: row.id,
        tenantId: row.tenantId,
        phone: row.phone,
        name: row.name,
        notes: row.notes,
        blocked: row.blocked,
        blockReason: row.blockReason,
        lastOrderAt: row.lastOrderAt ? row.lastOrderAt.toISOString() : null,
    };
}

const customerSelect = sql`
    id,
    tenant_id     as "tenantId",
    phone,
    name,
    notes,
    blocked,
    block_reason  as "blockReason",
    last_order_at as "lastOrderAt"
`;

export async function getCustomerByPhone(
    tenantId: string,
    phone: string
): Promise<Customer | null> {
    const rows = await sql<CustomerRow[]>`
        select ${customerSelect}
        from customers
        where tenant_id = ${tenantId} and phone = ${phone}
        limit 1
    `;
    return rows[0] ? mapCustomer(rows[0]) : null;
}

export async function upsertCustomer(input: {
    tenantId: string;
    phone: string;
    name?: string;
}): Promise<Customer> {
    const name = input.name ?? null;
    const rows = await sql<CustomerRow[]>`
        insert into customers (tenant_id, phone, name)
        values (${input.tenantId}, ${input.phone}, ${name})
        on conflict (tenant_id, phone) do update
            set name = coalesce(excluded.name, customers.name),
                updated_at = now()
        returning
            id,
            tenant_id     as "tenantId",
            phone,
            name,
            notes,
            blocked,
            block_reason  as "blockReason",
            last_order_at as "lastOrderAt"
    `;
    return mapCustomer(rows[0]);
}

type CustomerAddressRow = {
    id: string;
    customerId: string;
    label: string | null;
    street: string;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    zip: string | null;
    city: string | null;
    state: string | null;
    referencePoint: string | null;
    isDefault: boolean;
};

const addressSelect = sql`
    id,
    customer_id     as "customerId",
    label,
    street,
    number,
    complement,
    neighborhood,
    zip,
    city,
    state,
    reference_point as "referencePoint",
    is_default      as "isDefault"
`;

export async function getCustomerAddresses(
    customerId: string
): Promise<CustomerAddress[]> {
    const rows = await sql<CustomerAddressRow[]>`
        select ${addressSelect}
        from customer_addresses
        where customer_id = ${customerId}
        order by is_default desc, created_at asc
    `;
    return rows;
}

export async function getDefaultCustomerAddress(
    customerId: string
): Promise<CustomerAddress | null> {
    const rows = await sql<CustomerAddressRow[]>`
        select ${addressSelect}
        from customer_addresses
        where customer_id = ${customerId}
        order by is_default desc, created_at asc
        limit 1
    `;
    return rows[0] ?? null;
}

export async function addCustomerAddress(
    input: Omit<CustomerAddress, 'id'>
): Promise<CustomerAddress> {
    const rows = await sql<CustomerAddressRow[]>`
        insert into customer_addresses (
            customer_id, label, street, number, complement,
            neighborhood, zip, city, state, reference_point, is_default
        )
        values (
            ${input.customerId}, ${input.label}, ${input.street}, ${input.number}, ${input.complement},
            ${input.neighborhood}, ${input.zip}, ${input.city}, ${input.state}, ${input.referencePoint}, ${input.isDefault}
        )
        returning
            id,
            customer_id     as "customerId",
            label,
            street,
            number,
            complement,
            neighborhood,
            zip,
            city,
            state,
            reference_point as "referencePoint",
            is_default      as "isDefault"
    `;
    return rows[0];
}

export async function saveDefaultCustomerAddress(input: {
    customerId: string;
    label?: string | null;
    street: string;
    number?: string | null;
    complement?: string | null;
    neighborhood?: string | null;
    zip?: string | null;
    city?: string | null;
    state?: string | null;
    referencePoint?: string | null;
}): Promise<CustomerAddress> {
    return sql.begin(async (tx) => {
        await tx`
            update customer_addresses
            set is_default = false
            where customer_id = ${input.customerId}
        `;

        const rows = await tx<CustomerAddressRow[]>`
            insert into customer_addresses (
                customer_id, label, street, number, complement,
                neighborhood, zip, city, state, reference_point, is_default
            )
            values (
                ${input.customerId},
                ${input.label ?? null},
                ${input.street},
                ${input.number ?? null},
                ${input.complement ?? null},
                ${input.neighborhood ?? null},
                ${input.zip ?? null},
                ${input.city ?? null},
                ${input.state ?? null},
                ${input.referencePoint ?? null},
                true
            )
            returning ${addressSelect}
        `;

        return rows[0];
    });
}

export async function blockCustomer(
    customerId: string,
    reason: string
): Promise<void> {
    await sql`
        update customers
        set blocked = true, block_reason = ${reason}, updated_at = now()
        where id = ${customerId}
    `;
}

export async function unblockCustomer(customerId: string): Promise<void> {
    await sql`
        update customers
        set blocked = false, block_reason = null, updated_at = now()
        where id = ${customerId}
    `;
}
