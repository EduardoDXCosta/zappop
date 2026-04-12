import { NextResponse } from 'next/server';
import {
  getGlobalProducts,
  createGlobalProduct,
} from '@/lib/db/queries/global-products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await getGlobalProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('[Global Products GET Error]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 });
  }

  if (typeof body.name !== 'string' || !body.name.trim()) {
    return NextResponse.json(
      { error: 'Nome e obrigatorio' },
      { status: 400 }
    );
  }

  if (typeof body.category !== 'string' || !body.category.trim()) {
    return NextResponse.json(
      { error: 'Categoria e obrigatoria' },
      { status: 400 }
    );
  }

  try {
    const product = await createGlobalProduct({
      name: body.name.trim(),
      description:
        typeof body.description === 'string'
          ? body.description.trim() || undefined
          : undefined,
      imageUrl:
        typeof body.imageUrl === 'string'
          ? body.imageUrl.trim() || undefined
          : undefined,
      category: body.category.trim(),
    });
    return NextResponse.json({ product });
  } catch (error) {
    console.error('[Global Products POST Error]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
