import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionContext } from '@/lib/auth';
import { createTakeover, releaseTakeover } from '@/lib/db/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const cookieStore = await cookies();
    const impersonateId = cookieStore.get('impersonate_tenant')?.value ?? null;
    const session = await getSessionContext(impersonateId);

    if (!session.tenant) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
    }

    let body: { sessionId?: string; durationMinutes?: number };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'invalid json' }, { status: 400 });
    }

    const { sessionId, durationMinutes } = body;
    if (!sessionId) {
        return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const takeover = await createTakeover(
        sessionId,
        session.tenant.id,
        session.user?.id ?? null,
        durationMinutes
    );

    return NextResponse.json({ takeover });
}

export async function DELETE(req: NextRequest) {
    const cookieStore = await cookies();
    const impersonateId = cookieStore.get('impersonate_tenant')?.value ?? null;
    const session = await getSessionContext(impersonateId);

    if (!session.tenant) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
    }

    let body: { sessionId?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'invalid json' }, { status: 400 });
    }

    const { sessionId } = body;
    if (!sessionId) {
        return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    await releaseTakeover(sessionId);

    return NextResponse.json({ ok: true });
}
