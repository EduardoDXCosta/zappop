import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionContext } from '@/lib/auth';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    const cookieStore = await cookies();
    const impersonateId = cookieStore.get('impersonate_tenant')?.value ?? null;
    const session = await getSessionContext(impersonateId);

    if (!session.tenant) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
    }

    const tenantId = session.tenant.id;

    const rows = await sql<
        {
            sessionId: string;
            lastMessage: string;
            lastMessageAt: Date;
            customerName: string | null;
        }[]
    >`
        select distinct on (c.session_id)
            c.session_id as "sessionId",
            (c.message).content as "lastMessage",
            c.created_at   as "lastMessageAt",
            cust.name      as "customerName"
        from chats c
        left join customers cust on cust.phone = c.session_id and cust.tenant_id = ${tenantId}
        where c.tenant_id = ${tenantId}
          and c.session_id not like 'test_%'
        order by c.session_id, c.created_at desc
    `;

    const conversations = rows.map((r) => ({
        sessionId: r.sessionId,
        lastMessage: r.lastMessage ?? '',
        lastMessageAt: r.lastMessageAt.toISOString(),
        customerName: r.customerName,
    }));

    return NextResponse.json({ conversations });
}
