'use client';

import { api } from '@/lib/api-client';
import { useState, useEffect, useCallback, useRef } from 'react';

type Takeover = {
    id: number;
    sessionId: string;
    tenantId: string;
    pausedBy: string | null;
    pausedAt: string;
    expiresAt: string;
    releasedAt: string | null;
    active: boolean;
};

type Conversation = {
    sessionId: string;
    lastMessage: string;
    lastMessageAt: string;
    customerName: string | null;
};

function formatCountdown(expiresAt: string): string {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expirado';
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function HumanTakeoverPanel({ tenantId }: { tenantId: string }) {
    const [takeovers, setTakeovers] = useState<Takeover[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingSession, setSendingSession] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState<Record<string, string>>({});
    const [, setNow] = useState(Date.now());
    const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

    const fetchData = useCallback(async () => {
        try {
            const [takeoversData, convosData] = await Promise.all([
                api.get<{ takeovers: Takeover[] }>('/takeover/active'),
                api.get<{ conversations: Conversation[] }>(`/takeover/conversations?tenantId=${tenantId}`),
            ]);
            setTakeovers(takeoversData.takeovers ?? []);
            setConversations(convosData.conversations ?? []);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        fetchData();
        pollRef.current = setInterval(fetchData, 10000);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [fetchData]);

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    async function handleAssume(sessionId: string) {
        try {
            await api.post('/takeover', { sessionId });
            fetchData();
        } catch {
            // ignore
        }
    }

    async function handleRelease(sessionId: string) {
        try {
            await api.delete('/takeover', { body: { sessionId } });
            fetchData();
        } catch {
            // ignore
        }
    }

    async function handleSend(sessionId: string) {
        const text = messageInput[sessionId]?.trim();
        if (!text) return;

        setSendingSession(sessionId);
        try {
            await api.post('/takeover/send', { sessionId, text });
            setMessageInput((prev) => ({ ...prev, [sessionId]: '' }));
            fetchData();
        } catch {
            // ignore
        } finally {
            setSendingSession(null);
        }
    }

    function isActive(sessionId: string): boolean {
        return takeovers.some(
            (t) => t.sessionId === sessionId && t.active && new Date(t.expiresAt) > new Date()
        );
    }

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <p className="text-sm text-slate-500">Carregando conversas...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {conversations.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-8 text-center">
                    <p className="text-sm text-slate-500">Nenhuma conversa encontrada.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {conversations.map((convo) => {
                        const active = isActive(convo.sessionId);
                        const takeover = takeovers.find(
                            (t) => t.sessionId === convo.sessionId
                        );

                        return (
                            <div
                                key={convo.sessionId}
                                className={`rounded-2xl border bg-white/[0.03] p-4 ${
                                    active
                                        ? 'border-amber-400/30 bg-amber-400/5'
                                        : 'border-white/8'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-white truncate">
                                                {convo.customerName ?? convo.sessionId}
                                            </p>
                                            {active && (
                                                <span className="shrink-0 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                                                    Humano
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500 truncate">
                                            {convo.lastMessage}
                                        </p>
                                    </div>

                                    <div className="shrink-0">
                                        {active && takeover ? (
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-xs font-mono text-amber-300">
                                                    {formatCountdown(takeover.expiresAt)}
                                                </span>
                                                <button
                                                    onClick={() => handleRelease(convo.sessionId)}
                                                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                                                >
                                                    Devolver para IA
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleAssume(convo.sessionId)}
                                                className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-amber-300 cursor-pointer"
                                            >
                                                Assumir Conversa
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {active && (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSend(convo.sessionId);
                                        }}
                                        className="mt-3 flex items-center gap-2"
                                    >
                                        <input
                                            type="text"
                                            value={messageInput[convo.sessionId] ?? ''}
                                            onChange={(e) =>
                                                setMessageInput((prev) => ({
                                                    ...prev,
                                                    [convo.sessionId]: e.target.value,
                                                }))
                                            }
                                            placeholder="Digite sua mensagem..."
                                            disabled={sendingSession === convo.sessionId}
                                            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-amber-400/40 disabled:opacity-50"
                                        />
                                        <button
                                            type="submit"
                                            disabled={
                                                sendingSession === convo.sessionId ||
                                                !(messageInput[convo.sessionId]?.trim())
                                            }
                                            className="rounded-lg bg-amber-400 px-3 py-2 text-xs font-semibold text-black transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                                        >
                                            Enviar
                                        </button>
                                    </form>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
