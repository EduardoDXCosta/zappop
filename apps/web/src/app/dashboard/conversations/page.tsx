import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { HumanTakeoverPanel } from '../_components/human-takeover-panel';

export const dynamic = 'force-dynamic';

export default async function ConversationsPage() {
    const session = await getSession();

    if (session.role !== 'owner' && !session.impersonating) {
        redirect('/dashboard');
    }

    if (!session.tenant) {
        redirect('/');
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="font-[family:var(--font-display)] text-3xl text-white">
                    Conversas
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                    Assuma conversas da IA e atenda clientes diretamente.
                </p>
            </div>

            <HumanTakeoverPanel tenantId={session.tenant.id} />
        </div>
    );
}
