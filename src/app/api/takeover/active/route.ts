import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSessionContext } from '@/lib/auth';
import { getActiveTakeoversByTenant } from '@/lib/db/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
    const cookieStore = await cookies();
    const impersonateId = cookieStore.get('impersonate_tenant')?.value ?? null;
    const session = await getSessionContext(impersonateId);

    if (!session.tenant) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
    }

    const takeovers = await getActiveTakeoversByTenant(session.tenant.id);

    return NextResponse.json({ takeovers });
}
