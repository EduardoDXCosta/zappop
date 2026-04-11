import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthorized(req: NextRequest): boolean {
    const expected = process.env.EVOLUTION_WEBHOOK_TOKEN;
    if (!expected) return true;
    const header =
        req.headers.get('authorization') ??
        req.headers.get('x-webhook-token') ??
        '';
    const token = header.replace(/^Bearer\s+/i, '').trim();
    return token === expected;
}

export async function POST(req: NextRequest) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    let payload: unknown;
    try {
        payload = await req.json();
    } catch {
        return NextResponse.json({ error: 'invalid json' }, { status: 400 });
    }

    console.log(
        '[evolution webhook]',
        JSON.stringify(payload, null, 2).slice(0, 2000)
    );

    // TODO FASE 2: route event to attendance agent
    // TODO FASE 3: route admin-number events to admin agent

    return NextResponse.json({ ok: true });
}

export async function GET() {
    return NextResponse.json({ status: 'evolution webhook ready' });
}
