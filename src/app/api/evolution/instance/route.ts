import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import {
  connectInstance,
  ensureInstanceReady,
  fetchInstanceByName,
  getConnectionState,
  getWebhookConfig,
  logoutInstance,
} from '@/lib/evolution';
import { getDefaultTenantForApp } from '@/lib/db/queries';

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

async function buildStatus() {
  const tenant = await getDefaultTenantForApp();
  if (!tenant) return null;

  const instance = await fetchInstanceByName(tenant.slug);
  if (!instance) {
    return {
      tenant: { slug: tenant.slug, name: tenant.name },
      instance: {
        exists: false,
        instanceName: tenant.slug,
        connectionState: null,
        webhook: null,
        qr: null,
      },
    };
  }

  const [state, webhook] = await Promise.all([
    getConnectionState(tenant.slug),
    getWebhookConfig(tenant.slug),
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

export async function GET() {
  const payload = await buildStatus();

  if (!payload) {
    return NextResponse.json(
      { error: 'no tenant configured for onboarding' },
      { status: 404 }
    );
  }

  return NextResponse.json(payload);
}

export async function POST(req: NextRequest) {
  const tenant = await getDefaultTenantForApp();

  if (!tenant) {
    return NextResponse.json(
      { error: 'no tenant configured for onboarding' },
      { status: 404 }
    );
  }

  const webhookUrl = buildWebhookUrl(req);
  const ready = await ensureInstanceReady({
    instanceName: tenant.slug,
    webhookUrl,
  });
  const qr = await connectInstance(tenant.slug);
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

export async function PATCH(req: NextRequest) {
  const tenant = await getDefaultTenantForApp();

  if (!tenant) {
    return NextResponse.json(
      { error: 'no tenant configured for onboarding' },
      { status: 404 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { action?: string };

  if (body.action === 'refresh_qr') {
    const qr = await connectInstance(tenant.slug);
    const state = await getConnectionState(tenant.slug);

    return NextResponse.json({
      tenant: { slug: tenant.slug, name: tenant.name },
      instance: {
        exists: true,
        instanceName: tenant.slug,
        connectionState: state?.state ?? null,
        qr: {
          pairingCode: qr.pairingCode,
          attempts: qr.count,
          dataUrl: qr.code ? await QRCode.toDataURL(qr.code) : null,
        },
      },
    });
  }

  if (body.action === 'disconnect') {
    await logoutInstance(tenant.slug);
    const state = await getConnectionState(tenant.slug).catch(() => null);

    return NextResponse.json({
      tenant: { slug: tenant.slug, name: tenant.name },
      instance: {
        exists: true,
        instanceName: tenant.slug,
        connectionState: state?.state ?? 'close',
        qr: null,
      },
    });
  }

  return NextResponse.json({ error: 'invalid action' }, { status: 400 });
}

