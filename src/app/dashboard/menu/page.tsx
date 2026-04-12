import { getSessionContext } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MenuBuilder } from '@/app/_components/menu-builder';

export const dynamic = 'force-dynamic';

export default async function DashboardMenuPage() {
  const session = await getSessionContext();
  const tenant = session.tenant;

  if (!tenant) {
    redirect('/');
  }

  return <MenuBuilder tenantId={tenant.id} tenantName={tenant.name} />;
}
