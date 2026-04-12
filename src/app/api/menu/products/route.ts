import { NextResponse } from 'next/server';
import { createProduct, getProducts } from '@/lib/db/queries/menu';
import { getDefaultTenantForApp } from '@/lib/db/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const tenant = await getDefaultTenantForApp();
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant mockado nao encontrado' }, { status: 400 });
  }

  try {
    const products = await getProducts(tenant.id);
    return NextResponse.json({ products });
  } catch (error) {
    console.error('[Products API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const tenant = await getDefaultTenantForApp();
  if (!tenant) {
    return NextResponse.json({ error: 'Tenant mockado nao encontrado' }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    return NextResponse.json({ error: 'Nome do produto é obrigatório' }, { status: 400 });
  }

  const price = Number(body.price);
  if (isNaN(price) || price < 0) {
    return NextResponse.json({ error: 'Preço inválido' }, { status: 400 });
  }

  try {
    const product = await createProduct(
      tenant.id,
      typeof body.categoryId === 'string' && body.categoryId.trim().length > 0 ? body.categoryId : null,
      body.name.trim(),
      typeof body.description === 'string' ? body.description.trim() || null : null,
      price,
      typeof body.imageUrl === 'string' ? body.imageUrl.trim() || null : null
    );
    return NextResponse.json({ product });
  } catch (error) {
    console.error('[Products API Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
