import { api } from '@/lib/api-client';
import { cookies } from 'next/headers';
import { OwnerOverview } from './_components/owner-overview';
import { AdminCockpit } from './_components/admin-cockpit';
import type { SessionContext } from '@whatsmenu/shared';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;

  const session = await api.get<SessionContext>('/auth/me', {
    headers: {
      Cookie: `session_token=${sessionToken}`,
    },
  });

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
