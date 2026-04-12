import { sql } from '@/lib/db';
import type { HumanTakeover } from '@/lib/db/types';

type HumanTakeoverRow = {
    id: number;
    sessionId: string;
    tenantId: string;
    pausedBy: string | null;
    pausedAt: Date;
    expiresAt: Date;
    releasedAt: Date | null;
    active: boolean;
};

function mapHumanTakeover(row: HumanTakeoverRow): HumanTakeover {
    return {
        id: row.id,
        sessionId: row.sessionId,
        tenantId: row.tenantId,
        pausedBy: row.pausedBy,
        pausedAt: row.pausedAt.toISOString(),
        expiresAt: row.expiresAt.toISOString(),
        releasedAt: row.releasedAt ? row.releasedAt.toISOString() : null,
        active: row.active,
    };
}

export async function createTakeover(
    sessionId: string,
    tenantId: string,
    pausedBy: string | null,
    durationMinutes: number = 30
): Promise<HumanTakeover> {
    const expiresAt = new Date(Date.now() + durationMinutes * 60_000).toISOString();
    const rows = await sql<HumanTakeoverRow[]>`
        insert into human_takeovers (session_id, tenant_id, paused_by, expires_at)
        values (
            ${sessionId},
            ${tenantId},
            ${pausedBy},
            ${expiresAt}::timestamptz
        )
        returning
            id,
            session_id  as "sessionId",
            tenant_id   as "tenantId",
            paused_by   as "pausedBy",
            paused_at   as "pausedAt",
            expires_at  as "expiresAt",
            released_at as "releasedAt",
            active
    `;
    return mapHumanTakeover(rows[0]);
}

export async function getActiveTakeover(
    sessionId: string
): Promise<HumanTakeover | null> {
    const rows = await sql<HumanTakeoverRow[]>`
        select
            id,
            session_id  as "sessionId",
            tenant_id   as "tenantId",
            paused_by   as "pausedBy",
            paused_at   as "pausedAt",
            expires_at  as "expiresAt",
            released_at as "releasedAt",
            active
        from human_takeovers
        where session_id = ${sessionId}
          and active = true
        limit 1
    `;
    return rows[0] ? mapHumanTakeover(rows[0]) : null;
}

export async function releaseTakeover(
    sessionId: string
): Promise<void> {
    await sql`
        update human_takeovers
        set active = false,
            released_at = now()
        where session_id = ${sessionId}
          and active = true
    `;
}

export async function getActiveTakeoversByTenant(
    tenantId: string
): Promise<HumanTakeover[]> {
    const rows = await sql<HumanTakeoverRow[]>`
        select
            id,
            session_id  as "sessionId",
            tenant_id   as "tenantId",
            paused_by   as "pausedBy",
            paused_at   as "pausedAt",
            expires_at  as "expiresAt",
            released_at as "releasedAt",
            active
        from human_takeovers
        where tenant_id = ${tenantId}
          and active = true
        order by paused_at desc
    `;
    return rows.map(mapHumanTakeover);
}
