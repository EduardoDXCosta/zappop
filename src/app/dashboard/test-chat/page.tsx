import { getSessionContext } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TestChat } from '../_components/test-chat';

export const dynamic = 'force-dynamic';

export default async function TestChatPage() {
    const session = await getSessionContext();
    const tenant = session.tenant;

    if (!tenant) {
        redirect('/');
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="font-[family:var(--font-display)] text-3xl text-white">
                    Modo Teste
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                    Simule uma conversa com o robô antes de ativar o atendimento automático.
                </p>
            </div>

            <div className="rounded-2xl border border-amber-400/25 bg-amber-400/8 px-4 py-3">
                <p className="text-xs font-medium text-amber-200">
                    Este é um modo de teste. As mensagens NÃO são enviadas por WhatsApp, mas são salvas no banco.
                </p>
            </div>

            <TestChat tenantId={tenant.id} />
        </div>
    );
}
