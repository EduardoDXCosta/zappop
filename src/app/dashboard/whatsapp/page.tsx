import { getSessionContext } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { EvolutionConnectPanel } from '@/app/_components/evolution-connect-panel';

export const dynamic = 'force-dynamic';

export default async function DashboardWhatsAppPage() {
  const session = await getSessionContext();
  const tenant = session.tenant;

  if (!tenant) {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family:var(--font-display)] text-3xl text-white">
          Conexao WhatsApp
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Conecte o WhatsApp do restaurante para ativar o atendimento automatico.
        </p>
      </div>
      <EvolutionConnectPanel tenant={{ slug: tenant.slug, name: tenant.name }} />
    </div>
  );
}
