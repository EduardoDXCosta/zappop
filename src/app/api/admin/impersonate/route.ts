import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** POST: set impersonation cookie */
export async function POST(req: Request) {
  const { authorized } = await isAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const tenantId = body?.tenantId;

  const res = NextResponse.json({ ok: true });

  if (tenantId) {
    res.cookies.set('impersonate_tenant', tenantId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 4, // 4 hours
    });
  } else {
    res.cookies.delete('impersonate_tenant');
  }

  return res;
}

/** DELETE: clear impersonation cookie */
export async function DELETE() {
  const { authorized } = await isAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Nao autorizado' }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete('impersonate_tenant');
  return res;
}
