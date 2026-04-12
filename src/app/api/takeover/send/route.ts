import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionContext } from '@/lib/auth';
import { appendChat } from '@/lib/db/queries';
import { getEvolutionClient } from '@/lib/evolution';
import { getTenantById } from '@/lib/db/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const cookieStore = await cookies();
    const impersonateId = cookieStore.get('impersonate_tenant')?.value ?? null;
    const session = await getSessionContext(impersonateId);

    if (!session.tenant) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
    }

    let body: { sessionId?: string; text?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'invalid json' }, { status: 400 });
    }

    const { sessionId, text } = body;
    if (!sessionId || !text) {
        return NextResponse.json(
            { error: 'sessionId and text are required' },
            { status: 400 }
        );
    }

    await appendChat({
        sessionId,
        tenantId: session.tenant.id,
        role: 'assistant',
        message: { content: `[Atendente] ${text}` },
    });

    const tenant = await getTenantById(session.tenant.id);
    if (tenant) {
        try {
            const evo = getEvolutionClient();
            await evo.sendText(tenant.slug, sessionId, text);
        } catch (err) {
            console.error('[takeover/send] failed to send via evolution', err);
        }
    }

    return NextResponse.json({ ok: true });
}
