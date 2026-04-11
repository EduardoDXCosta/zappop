import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { connectInstance, getConnectionState } from '@/lib/evolution';
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

  const qr = await connectInstance(slug);
  const state = await getConnectionState(slug);

  return NextResponse.json({
    tenant: { slug: tenant.slug, name: tenant.name },
    instance: {
      exists: true,
      instanceName: slug,
      connectionState: state?.state ?? null,
      qr: {
        pairingCode: qr.pairingCode,
        attempts: qr.count,
        dataUrl: qr.code ? await QRCode.toDataURL(qr.code) : null,
      },
    },
  });
}

