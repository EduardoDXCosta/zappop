import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import type { Chat, ChatRole, ChatMessage } from '@/lib/db/types';

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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const tenantId = req.nextUrl.searchParams.get('tenantId');
    if (!tenantId) {
        return NextResponse.json(
            { error: 'tenantId is required' },
            { status: 400 }
        );
    }

    const sessionId = `test_${tenantId}`;

    const rows = await sql<ChatRow[]>`
        select
            id,
            session_id  as "sessionId",
            tenant_id   as "tenantId",
            role,
            message,
            created_at  as "createdAt"
        from chats
        where session_id = ${sessionId}
          and tenant_id = ${tenantId}
          and role in ('user', 'assistant')
        order by created_at asc
    `;

    return NextResponse.json({ messages: rows.map(mapChat) });
}
