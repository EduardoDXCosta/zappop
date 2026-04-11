import { sql } from '@/lib/db';
import type { Conversation, ConversationRole } from '@/lib/db/types';

type ConversationRow = {
    id: string;
    tenantId: string;
    customerId: string;
    role: ConversationRole;
    content: string;
    metadata: unknown;
    createdAt: Date;
};

function mapConversation(row: ConversationRow): Conversation {
    return {
        id: row.id,
        tenantId: row.tenantId,
        customerId: row.customerId,
        role: row.role,
        content: row.content,
        metadata: row.metadata,
        createdAt: row.createdAt.toISOString(),
    };
}

export async function appendMessage(input: {
    tenantId: string;
    customerId: string;
    role: ConversationRole;
    content: string;
    metadata?: unknown;
}): Promise<Conversation> {
    const metadata =
        input.metadata === undefined
            ? null
            : sql.json(input.metadata as never);
    const rows = await sql<ConversationRow[]>`
        insert into conversations (tenant_id, customer_id, role, content, metadata)
        values (${input.tenantId}, ${input.customerId}, ${input.role}, ${input.content}, ${metadata})
        returning
            id,
            tenant_id   as "tenantId",
            customer_id as "customerId",
            role,
            content,
            metadata,
            created_at  as "createdAt"
    `;
    return mapConversation(rows[0]);
}

export async function getRecentMessages(
    customerId: string,
    limit: number
): Promise<Conversation[]> {
    const rows = await sql<ConversationRow[]>`
        select
            id,
            tenant_id   as "tenantId",
            customer_id as "customerId",
            role,
            content,
            metadata,
            created_at  as "createdAt"
        from (
            select *
            from conversations
            where customer_id = ${customerId}
            order by created_at desc
            limit ${limit}
        ) sub
        order by created_at asc
    `;
    return rows.map(mapConversation);
}
