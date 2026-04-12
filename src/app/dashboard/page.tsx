import { getSessionContext } from '@/lib/auth';
import { OwnerOverview } from './_components/owner-overview';
import { AdminCockpit } from './_components/admin-cockpit';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSessionContext();

  if (session.role === 'admin' && !session.impersonating) {
    return <AdminCockpit />;
  }

  if (!session.tenant) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-slate-400">
          Nenhum restaurante encontrado. Complete o onboarding primeiro.
        </p>
      </div>
    );
  }

  return <OwnerOverview tenant={session.tenant} />;
}
