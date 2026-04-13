import { getDefaultTenantForApp, adminExists } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { CompanyOnboarding } from './_components/company-onboarding';

export const dynamic = 'force-dynamic';

export default async function Home() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    if (sessionToken) {
        redirect('/dashboard');
    }

    const hasAdmin = await adminExists();
    if (!hasAdmin) {
        redirect('/setup');
    }

    const tenant = await getDefaultTenantForApp();
    if (tenant) {
        redirect('/login');
    }

    return (
        <main className="relative flex-1 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,188,89,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(232,115,42,0.16),_transparent_22%)]" />
            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
                <CompanyOnboarding initialTenant={null} />
            </div>
        </main>
    );
}
