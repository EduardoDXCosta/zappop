'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SetupForm() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function formatPhone(value: string) {
        const digits = value.replace(/\D/g, '');
        if (digits.length <= 2) return digits;
        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        if (digits.length <= 11)
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('As senhas não conferem');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);

        const digits = phone.replace(/\D/g, '');
        if (digits.length < 10) {
            setError('Telefone inválido');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/setup-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone: digits, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Erro ao criar administrador');
                setLoading(false);
                return;
            }
            router.push('/dashboard');
        } catch {
            setError('Erro de conexão');
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-white/8 bg-[#0d0f16] p-6"
        >
            {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Seu nome
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Eduardo Costa"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Telefone
                </label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Criar senha
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Confirmar senha
                </label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-amber-300 disabled:opacity-50"
            >
                {loading ? 'Criando...' : 'Criar administrador e entrar'}
            </button>

            <p className="text-center text-xs text-slate-500">
                Este será o único cadastro de administrador do sistema.
            </p>
        </form>
    );
}
