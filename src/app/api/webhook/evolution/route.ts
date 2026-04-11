import { NextRequest, NextResponse } from 'next/server';
import { parseEvolutionEvent } from '@/lib/evolution';
import { handleIncomingMessage } from '@/lib/agent';

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
    const queryToken = req.nextUrl.searchParams.get('token')?.trim() ?? '';
    return token === expected || queryToken === expected;
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

    const parsed = parseEvolutionEvent(payload);

    if (parsed.event === 'ignored') {
        return NextResponse.json({ ok: true, ignored: parsed.reason });
    }

    // Why: fire-and-forget so Evolution gets a 200 fast; errors are logged.
    handleIncomingMessage(parsed).catch((err) => {
        console.error('[webhook] agent error', err);
    });

    return NextResponse.json({ ok: true });
}

export async function GET() {
    return NextResponse.json({ status: 'evolution webhook ready' });
}
