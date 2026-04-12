import { NextResponse } from 'next/server';
import { getDefaultTenantForApp } from '@/lib/db/queries';
import { cloneGlobalProductToTenant } from '@/lib/db/queries/global-products';
import { getProducts } from '@/lib/db/queries/menu';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const tenant = await getDefaultTenantForApp();
  if (!tenant) {
    return NextResponse.json(
      { error: 'Tenant nao encontrado' },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 });
  }

  const { globalProductId, categoryId, price } = body;
  if (!globalProductId || !categoryId) {
    return NextResponse.json(
      { error: 'globalProductId e categoryId sao obrigatorios' },
      { status: 400 }
    );
  }

  try {
    const result = await cloneGlobalProductToTenant(
      globalProductId,
      tenant.id,
      categoryId,
      typeof price === 'number' ? price : 0
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Produto global nao encontrado' },
        { status: 404 }
      );
    }

    // Return the full product so the UI can update
    const allProducts = await getProducts(tenant.id);
    const product = allProducts.find(p => p.id === result.id);

    return NextResponse.json({ product: product ?? result });
  } catch (error) {
    console.error('[Clone Product Error]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
