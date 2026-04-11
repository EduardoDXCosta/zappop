import { NextResponse } from 'next/server';
import { getConnectionState, logoutInstance } from '@/lib/evolution';
import { getTenantBySlug } from '@/lib/db/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const tenant = await getTenantBySlug(slug);

  if (!tenant) {
    return NextResponse.json({ error: 'tenant not found' }, { status: 404 });
  }

  await logoutInstance(slug);
  const state = await getConnectionState(slug).catch(() => null);

  return NextResponse.json({
    tenant: { slug: tenant.slug, name: tenant.name },
    instance: {
      exists: true,
      instanceName: slug,
      connectionState: state?.state ?? 'close',
      qr: null,
    },
  });
}

