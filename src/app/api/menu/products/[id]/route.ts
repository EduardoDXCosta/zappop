import { NextResponse } from 'next/server';
import {
  updateProductPrice,
  updateProductAvailability,
} from '@/lib/db/queries/menu';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 });
  }

  try {
    // Update price
    if (typeof body.price === 'number') {
      if (body.price < 0) {
        return NextResponse.json(
          { error: 'Preco invalido' },
          { status: 400 }
        );
      }
      const product = await updateProductPrice(id, body.price);
      if (!product) {
        return NextResponse.json(
          { error: 'Produto nao encontrado' },
          { status: 404 }
        );
      }
      return NextResponse.json({ product });
    }

    // Update availability
    if (typeof body.available === 'boolean') {
      const product = await updateProductAvailability(id, body.available);
      if (!product) {
        return NextResponse.json(
          { error: 'Produto nao encontrado' },
          { status: 404 }
        );
      }
      return NextResponse.json({ product });
    }

    return NextResponse.json(
      { error: 'Nenhum campo valido para atualizar' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Product PATCH Error]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
