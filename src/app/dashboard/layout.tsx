import { getSessionContext } from '@/lib/auth';
import { Sidebar } from './_components/sidebar';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read impersonation from cookie (set via client-side navigation)
  const cookieStore = await cookies();
  const impersonateId = cookieStore.get('impersonate_tenant')?.value ?? null;

  const session = await getSessionContext(impersonateId);

  if (!session.user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#090b11]">
      <Sidebar
        role={session.role}
        tenantName={session.tenant?.name ?? null}
        userName={session.user?.name ?? null}
        impersonating={session.impersonating}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
