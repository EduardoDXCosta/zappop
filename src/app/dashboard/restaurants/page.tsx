import { getAllTenants } from '@/lib/db/queries';
import { getSessionContext } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ImpersonateButton } from './_components/impersonate-button';

export const dynamic = 'force-dynamic';

export default async function RestaurantsPage() {
  const session = await getSessionContext();
  if (session.role !== 'admin') redirect('/dashboard');

  const tenants = await getAllTenants();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family:var(--font-display)] text-3xl text-white">
          Restaurantes
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {tenants.length} tenant{tenants.length !== 1 ? 's' : ''} cadastrado{tenants.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 text-slate-500">
              <th className="py-3 px-5 text-left font-medium">Nome</th>
              <th className="py-3 px-5 text-left font-medium">Slug</th>
              <th className="py-3 px-5 text-left font-medium">Plano</th>
              <th className="py-3 px-5 text-left font-medium">Status</th>
              <th className="py-3 px-5 text-left font-medium">WhatsApp</th>
              <th className="py-3 px-5 text-right font-medium">Acao</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map(t => (
              <tr key={t.id} className="border-b border-white/5 last:border-0">
                <td className="py-3 px-5 font-medium text-white">{t.name}</td>
                <td className="py-3 px-5 text-slate-400 font-mono text-xs">{t.slug}</td>
                <td className="py-3 px-5">
                  <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300 capitalize">
                    {t.plan}
                  </span>
                </td>
                <td className="py-3 px-5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      t.planStatus === 'active'
                        ? 'bg-emerald-500/10 text-emerald-300'
                        : t.planStatus === 'trial'
                        ? 'bg-blue-500/10 text-blue-300'
                        : t.planStatus === 'blocked'
                        ? 'bg-rose-500/10 text-rose-300'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {t.planStatus}
                  </span>
                </td>
                <td className="py-3 px-5 text-slate-400 text-xs">
                  {t.whatsappCustomerNumber ?? '---'}
                </td>
                <td className="py-3 px-5 text-right">
                  <ImpersonateButton tenantId={t.id} />
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Nenhum restaurante cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
