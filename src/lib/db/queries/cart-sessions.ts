import { sql } from '@/lib/db';
import type { CartSession } from '@/lib/db/types';

type CartSessionRow = {
    id: number;
    sessionId: string;
    tenantId: string;
    lastActive: Date;
    hasOrder: boolean;
    recovered: boolean;
    createdAt: Date;
};

function mapCartSession(row: CartSessionRow): CartSession {
    return {
        id: row.id,
        sessionId: row.sessionId,
        tenantId: row.tenantId,
        lastActive: row.lastActive.toISOString(),
        hasOrder: row.hasOrder,
        recovered: row.recovered,
        createdAt: row.createdAt.toISOString(),
    };
}

export async function upsertCartSession(
    sessionId: string,
    tenantId: string
): Promise<CartSession> {
    const rows = await sql<CartSessionRow[]>`
        insert into cart_sessions (session_id, tenant_id, last_active)
        values (${sessionId}, ${tenantId}, now())
        on conflict (session_id) where has_order = false
        do update set last_active = now()
        returning
            id,
            session_id  as "sessionId",
            tenant_id   as "tenantId",
            last_active as "lastActive",
            has_order   as "hasOrder",
            recovered,
            created_at  as "createdAt"
    `;
    if (rows.length > 0) return mapCartSession(rows[0]);

    const insertRows = await sql<CartSessionRow[]>`
        insert into cart_sessions (session_id, tenant_id, last_active)
        values (${sessionId}, ${tenantId}, now())
        returning
            id,
            session_id  as "sessionId",
            tenant_id   as "tenantId",
            last_active as "lastActive",
            has_order   as "hasOrder",
            recovered,
            created_at  as "createdAt"
    `;
    return mapCartSession(insertRows[0]);
}

export async function markCartOrdered(sessionId: string): Promise<void> {
    await sql`
        update cart_sessions
        set has_order = true
        where session_id = ${sessionId} and has_order = false
    `;
}

export async function getPendingCarts(
    olderThanMinutes: number
): Promise<CartSession[]> {
    const rows = await sql<CartSessionRow[]>`
        select
            id,
            session_id  as "sessionId",
            tenant_id   as "tenantId",
            last_active as "lastActive",
            has_order   as "hasOrder",
            recovered,
            created_at  as "createdAt"
        from cart_sessions
        where has_order = false
          and recovered = false
          and last_active < now() - interval '1 minute' * ${olderThanMinutes}
    `;
    return rows.map(mapCartSession);
}

export async function markCartRecovered(id: number): Promise<void> {
    await sql`
        update cart_sessions
        set recovered = true
        where id = ${id}
    `;
}

export async function getRecoveredCartRevenue(
    tenantId?: string
): Promise<number> {
    const rows = await sql<{ total: string }[]>`
        select coalesce(sum(o.total), 0)::text as total
        from cart_sessions cs
        join customers cu on cu.phone = cs.session_id
        join orders o on o.customer_id = cu.id and o.tenant_id = cs.tenant_id
        where cs.recovered = true
          and cs.has_order = true
          and o.status != 'cancelado'
          and o.created_at >= date_trunc('month', current_date)
          ${tenantId ? sql`and cs.tenant_id = ${tenantId}` : sql``}
    `;
    return Number(rows[0].total);
}
