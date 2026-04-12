import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getRecoveredCartRevenue } from '@/lib/db/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { authorized } = await isAdmin();
    if (!authorized) {
        return NextResponse.json({ error: 'Nao autorizado' }, { status: 403 });
    }

    try {
        const url = new URL(request.url);
        const tenantId = url.searchParams.get('tenantId') ?? undefined;
        const revenue = await getRecoveredCartRevenue(tenantId);
        return NextResponse.json({ recoveredRevenue: revenue });
    } catch (error) {
        console.error('[recovered-revenue] error', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
