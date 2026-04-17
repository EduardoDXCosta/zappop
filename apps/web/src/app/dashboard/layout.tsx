import { getSession } from '@/lib/session';
import { Sidebar } from './_components/sidebar';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;

  if (!sessionToken) {
    redirect('/login');
  }

  const session = await getSession();

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
