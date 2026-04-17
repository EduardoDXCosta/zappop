import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { GlobalProductManager } from './_components/global-product-manager';

export const dynamic = 'force-dynamic';

export default async function GlobalProductsPage() {
  const session = await getSession();
  if (session.role !== 'admin') redirect('/dashboard');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family:var(--font-display)] text-3xl text-white">
          Galeria Global de Produtos
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Cadastre itens mestre que qualquer restaurante pode clonar para seu cardapio.
        </p>
      </div>
      <GlobalProductManager />
    </div>
  );
}
