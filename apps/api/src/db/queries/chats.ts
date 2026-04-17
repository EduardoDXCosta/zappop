import { sql } from '../connection.js';
import type { Chat, ChatRole, ChatMessage } from '../types.js';

type ChatRow = {
    id: number;
    sessionId: string;
    tenantId: string | null;
    role: string | null;
    message: ChatMessage;
    createdAt: Date;
};

function mapChat(row: ChatRow): Chat {
    return {
        id: row.id,
        sessionId: row.sessionId,
        tenantId: row.tenantId,
        role: (row.role as ChatRole) ?? null,
        message: row.message,
        createdAt: row.createdAt.toISOString(),
    };
}

export async function appendChat(input: {
    sessionId: string;
    tenantId: string;
    role: ChatRole | null;
    message: ChatMessage;
}): Promise<Chat> {
    const rows = await sql<ChatRow[]>`
        insert into chats (session_id, tenant_id, role, message)
        values (${input.sessionId}, ${input.tenantId}, ${input.role}, ${sql.json(input.message as never)})
        returning
            id,
            session_id  as "sessionId",
            tenant_id   as "tenantId",
            role,
            message,
            created_at  as "createdAt"
    `;
    return mapChat(rows[0]);
}

export async function getRecentChats(
    sessionId: string,
    limit: number
): Promise<Chat[]> {
    const rows = await sql<ChatRow[]>`
        select
            id,
            session_id  as "sessionId",
            tenant_id   as "tenantId",
            role,
            message,
            created_at  as "createdAt"
        from (
            select *
            from chats
            where session_id = ${sessionId}
            order by created_at desc
            limit ${limit}
        ) sub
        order by created_at asc
    `;
    return rows.map(mapChat);
}
