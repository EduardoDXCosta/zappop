import { api, ApiClientError } from '@/lib/api-client';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { CompanyOnboarding } from './_components/company-onboarding';
import type { SessionContext } from '@whatsmenu/shared';

export const dynamic = 'force-dynamic';

export default async function Home() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    if (sessionToken) {
        redirect('/dashboard');
    }

    // Check if admin exists
    try {
        const result = await api.get<{ exists: boolean }>('/setup-admin/check');
        if (!result.exists) {
            redirect('/setup');
        }
    } catch {
        // If API is not reachable, show onboarding
    }

    redirect('/login');
}
