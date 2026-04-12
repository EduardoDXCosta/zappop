import { NextRequest, NextResponse } from 'next/server';
import { handleTestMessage } from '@/lib/agent/test-runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    let body: { tenantId?: string; message?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'invalid json' }, { status: 400 });
    }

    const { tenantId, message } = body;
    if (!tenantId || !message) {
        return NextResponse.json(
            { error: 'tenantId and message are required' },
            { status: 400 }
        );
    }

    try {
        const result = await handleTestMessage({ tenantId, message });
        return NextResponse.json(result);
    } catch (err) {
        console.error('[test-chat] error', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'internal error' },
            { status: 500 }
        );
    }
}
