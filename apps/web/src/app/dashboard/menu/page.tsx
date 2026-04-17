import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { MenuBuilder } from '@/app/_components/menu-builder';

export const dynamic = 'force-dynamic';

export default async function DashboardMenuPage() {
  const session = await getSession();
  const tenant = session.tenant;

  if (!tenant) {
    redirect('/');
  }

  return <MenuBuilder tenantId={tenant.id} tenantName={tenant.name} />;
}
