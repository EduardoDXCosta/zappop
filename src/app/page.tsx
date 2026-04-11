import { CompanyOnboarding } from './_components/company-onboarding';
import { getDefaultTenantForApp } from '@/lib/db/queries';

export default async function Home() {
  const tenant = await getDefaultTenantForApp();

  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,188,89,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(232,115,42,0.16),_transparent_22%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-amber-200/70">
              WhatsMenu
            </p>
            <h1 className="mt-2 font-[family:var(--font-display)] text-3xl text-white sm:text-4xl">
              Onboarding do restaurante
            </h1>
          </div>
          <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-300 backdrop-blur">
            Cadastro da empresa + conexão do WhatsApp
          </div>
        </div>

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
