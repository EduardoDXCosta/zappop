import { NextResponse } from 'next/server';
import { createCategory, getCategories } from '@/lib/db/queries/menu';
import { getDefaultTenantForApp } from '@/lib/db/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const tenant = await getDefaultTenantForApp();
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant mockado nao encontrado' }, { status: 400 });
  }

  try {
    const categories = await getCategories(tenant.id);
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('[Categories API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const tenant = await getDefaultTenantForApp();
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant mockado nao encontrado' }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return NextResponse.json({ error: 'Nome da categoria é obrigatório' }, { status: 400 });
  }

  try {
    const category = await createCategory(tenant.id, body.name.trim());
    return NextResponse.json({ category });
  } catch (error) {
    console.error('[Categories API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
