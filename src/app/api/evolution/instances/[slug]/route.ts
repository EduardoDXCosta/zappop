import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import {
  connectInstance,
  ensureInstanceReady,
  fetchInstanceByName,
  getConnectionState,
  getWebhookConfig,
} from '@/lib/evolution';
import { getTenantBySlug } from '@/lib/db/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildWebhookUrl(req: NextRequest): string {
  const token = process.env.EVOLUTION_WEBHOOK_TOKEN?.trim();
  const url = new URL('/api/webhook/evolution', req.nextUrl.origin);
  if (token) {
    url.searchParams.set('token', token);
  }
  return url.toString();
}

async function buildStatusPayload(slug: string) {
  const tenant = await getTenantBySlug(slug);
  if (!tenant) return null;

  const instance = await fetchInstanceByName(slug);
  if (!instance) {
    return {
      tenant: { slug: tenant.slug, name: tenant.name },
      instance: {
        exists: false,
        instanceName: slug,
        connectionState: null,
        webhook: null,
        qr: null,
      },
    };
  }

  const [state, webhook] = await Promise.all([
    getConnectionState(slug),
    getWebhookConfig(slug),
  ]);

  return {
    tenant: { slug: tenant.slug, name: tenant.name },
    instance: {
      exists: true,
      ...instance,
      connectionState: state?.state ?? null,
      webhook,
      qr: null,
    },
  };
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const payload = await buildStatusPayload(slug);

  if (!payload) {
    return NextResponse.json({ error: 'tenant not found' }, { status: 404 });
  }

  return NextResponse.json(payload);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const tenant = await getTenantBySlug(slug);

  if (!tenant) {
    return NextResponse.json({ error: 'tenant not found' }, { status: 404 });
  }

  const webhookUrl = buildWebhookUrl(req);
  const ready = await ensureInstanceReady({
    instanceName: slug,
    webhookUrl,
  });
  const qr = await connectInstance(slug);
  const qrDataUrl = qr.code ? await QRCode.toDataURL(qr.code) : null;

  return NextResponse.json({
    tenant: { slug: tenant.slug, name: tenant.name },
    instance: {
      exists: true,
      ...ready.instance,
      connectionState: ready.state?.state ?? null,
      webhook: ready.webhook,
      qr: {
        pairingCode: qr.pairingCode,
        attempts: qr.count,
        dataUrl: qrDataUrl,
      },
    },
  });
}

