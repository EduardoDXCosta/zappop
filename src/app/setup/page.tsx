import { redirect } from 'next/navigation';
import { adminExists } from '@/lib/db/queries';
import { cookies } from 'next/headers';
import { SetupForm } from './setup-form';

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    if (sessionToken) {
        redirect('/dashboard');
    }

    const hasAdmin = await adminExists();
    if (hasAdmin) {
        redirect('/login');
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#090b11] px-4">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,188,89,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(232,115,42,0.16),_transparent_22%)]" />
            <div className="relative z-10 w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/15 text-2xl mb-4">
                        🍽️
                    </div>
                    <h1 className="text-2xl font-bold text-white">ZapPop</h1>
                    <p className="text-sm text-slate-400 mt-1">Configuração inicial do sistema</p>
                </div>

                <SetupForm />
            </div>
        </main>
    );
}
