import { NextResponse } from 'next/server';
import {
  updateGlobalProduct,
  deleteGlobalProduct,
} from '@/lib/db/queries/global-products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 });
  }

  try {
    const product = await updateGlobalProduct(id, {
      name: typeof body.name === 'string' ? body.name.trim() : undefined,
      description:
        typeof body.description === 'string' ? body.description : undefined,
      imageUrl:
        typeof body.imageUrl === 'string' ? body.imageUrl : undefined,
      category:
        typeof body.category === 'string' ? body.category.trim() : undefined,
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produto nao encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('[Global Product PUT Error]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const deleted = await deleteGlobalProduct(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Produto nao encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Global Product DELETE Error]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
