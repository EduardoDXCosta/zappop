import { CompanyOnboarding } from './_components/company-onboarding';
import { getDefaultTenantForApp } from '@/lib/db/queries';

export default async function Home() {
  const tenant = await getDefaultTenantForApp();

  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,188,89,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(232,115,42,0.16),_transparent_22%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        <CompanyOnboarding
          initialTenant={
            tenant
              ? {
                  slug: tenant.slug,
                  name: tenant.name,
                }
              : null
          }
        />
      </div>
    </main>
  );
}
