import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getPlatformMetrics } from '@/lib/db/queries/metrics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const { authorized } = await isAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 403 });
  }

  try {
    const metrics = await getPlatformMetrics();
    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('[Admin Metrics Error]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
