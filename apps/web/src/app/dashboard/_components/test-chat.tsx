'use client';

import { api, ApiClientError } from '@/lib/api-client';
import { useState, useRef, useEffect, useCallback } from 'react';

type Message = {
    id: number;
    role: 'user' | 'assistant';
    message: { content: string };
    createdAt: string;
};

interface TestChatProps {
    tenantId: string;
}

export function TestChat({ tenantId }: TestChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        api.get<{ messages: Message[] }>(`/test-chat/history?tenantId=${tenantId}`)
            .then((data) => {
                if (data.messages) setMessages(data.messages);
            })
            .catch(() => {});
    }, [tenantId]);

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        const text = input.trim();
        if (!text || loading) return;

        const optimistic: Message = {
            id: Date.now(),
            role: 'user',
            message: { content: text },
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimistic]);
        setInput('');
        setLoading(true);

        try {
            const data = await api.post<{ sessionId: string; reply: string }>('/test-chat', { tenantId, message: text });
            setSessionId(data.sessionId);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: 'assistant',
                    message: { content: data.reply },
                    createdAt: new Date().toISOString(),
                },
            ]);
        } catch (err) {
            const errMsg = err instanceof ApiClientError ? err.message : 'Erro de conexão. Tente novamente.';
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: 'assistant',
                    message: { content: errMsg },
                    createdAt: new Date().toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    }

    function handleClear() {
        if (sessionId) {
            setMessages([]);
            setSessionId(null);
        } else {
            setMessages([]);
        }
    }

    return (
        <div className="flex h-[calc(100vh-6rem)] flex-col rounded-2xl border border-white/8 bg-white/[0.03]">
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                <div>
                    <h2 className="text-sm font-bold text-white">
                        Modo Teste — Simule uma conversa com o robô
                    </h2>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                        As mensagens NÃO são enviadas por WhatsApp
                    </p>
                </div>
                <button
                    onClick={handleClear}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                >
                    Limpar conversa
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.length === 0 && (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-sm text-slate-600">
                            Envie uma mensagem para testar o atendimento automático
                        </p>
                    </div>
                )}
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                                msg.role === 'user'
                                    ? 'bg-amber-400/15 text-amber-100'
                                    : 'bg-white/[0.06] text-slate-200'
                            }`}
                        >
                            {msg.message.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-2xl bg-white/[0.06] px-4 py-2.5 text-sm text-slate-400">
                            <span className="inline-flex gap-1">
                                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>·</span>
                                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>·</span>
                                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>·</span>
                            </span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <form
                onSubmit={sendMessage}
                className="flex items-center gap-3 border-t border-white/8 px-5 py-3"
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    disabled={loading}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-amber-400/40 focus:ring-1 focus:ring-amber-400/20 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                    Enviar
                </button>
            </form>
        </div>
    );
}
