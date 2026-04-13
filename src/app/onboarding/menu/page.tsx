import { getDefaultTenantForApp } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { MenuBuilder } from '@/app/_components/menu-builder';

export const dynamic = 'force-dynamic';

export default async function OnboardingMenuPage() {
  const tenant = await getDefaultTenantForApp();

  if (!tenant) {
    redirect('/');
  }

  return (
    <main className="relative flex-1 overflow-hidden min-h-screen bg-[#11131A] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,188,89,0.12),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(232,115,42,0.10),_transparent_22%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col py-8 sm:px-6 lg:px-8">
        <MenuBuilder tenantId={tenant.id} tenantName={tenant.name} />
      </div>
    </main>
  );
}
