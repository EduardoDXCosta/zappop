'use client';

import { useEffect, useEffectEvent, useState, useTransition } from 'react';

export interface ConnectTenant {
  slug: string;
  name: string;
}

type InstancePayload = {
  exists: boolean;
  instanceName: string;
  connectionState: string | null;
  owner?: string | null;
  profileName?: string | null;
  profileStatus?: string | null;
  webhook?: {
    enabled: boolean;
    url: string | null;
    events: string[];
  } | null;
  qr?: {
    pairingCode: string | null;
    attempts: number | null;
    dataUrl: string | null;
  } | null;
};

type StatusResponse = {
  tenant: ConnectTenant;
  instance: InstancePayload;
};

function statusLabel(state: string | null): string {
  switch (state) {
    case 'open':
      return 'Conectado';
    case 'connecting':
      return 'Conectando';
    case 'close':
      return 'Desconectado';
    default:
      return state ?? 'Sem status';
  }
}

function statusTone(state: string | null): string {
  switch (state) {
    case 'open':
      return 'bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-400/35';
    case 'connecting':
      return 'bg-amber-500/15 text-amber-100 ring-1 ring-amber-400/35';
    default:
      return 'bg-white/8 text-white/80 ring-1 ring-white/10';
  }
}

interface EvolutionConnectPanelProps {
  tenant: ConnectTenant;
}

export function EvolutionConnectPanel({ tenant }: EvolutionConnectPanelProps) {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const basePath = `/api/evolution/instances/${encodeURIComponent(tenant.slug)}`;

  const loadStatus = useEffectEvent(async () => {
    const res = await fetch(basePath, {
      cache: 'no-store',
    });
    const payload = (await res.json()) as StatusResponse | { error: string };
    if (!res.ok) {
      throw new Error('error' in payload ? payload.error : 'Falha ao consultar instância');
    }
    setData(payload as StatusResponse);
  });

  useEffect(() => {
    loadStatus().catch((err) => {
      setError(err instanceof Error ? err.message : String(err));
    });
  }, [loadStatus, tenant.slug]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      loadStatus().catch(() => {
        // silent during polling
      });
    }, 8000);
    return () => window.clearInterval(timer);
  }, [loadStatus, tenant.slug]);

  async function runAction(
    path: string,
    method: 'POST',
    successMessage: string
  ) {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const res = await fetch(path, {
          method,
          cache: 'no-store',
        });
        const payload = (await res.json()) as StatusResponse | { error: string };
        if (!res.ok) {
          throw new Error('error' in payload ? payload.error : 'Falha ao executar ação');
        }

        setData(payload as StatusResponse);
        setSuccess(successMessage);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    });
  }

  const currentState = data?.instance.connectionState ?? null;
  const activeData = data?.tenant ? data : { tenant, instance: null };

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[radial-gradient(circle_at_top_left,_rgba(255,196,89,0.24),_transparent_28%),linear-gradient(160deg,rgba(27,29,39,0.92),rgba(9,11,18,0.98))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:p-8">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)] opacity-60" />
      <div className="relative space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200/75">
              Etapa 2 · Conexão WhatsApp
            </p>
            <h1 className="font-[family:var(--font-display)] text-4xl leading-none text-white sm:text-5xl">
              Conecte o WhatsApp do restaurante em poucos cliques.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              O sistema já sabe qual restaurante está sendo configurado, prepara a instância no backend,
              gera o QR Code e acompanha o estado da sessão automaticamente.
            </p>
          </div>
          <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/6 px-5 py-4 text-sm text-slate-200 backdrop-blur">
            <span className="text-xs uppercase tracking-[0.28em] text-white/50">
              Como funciona
            </span>
            <span>1. Gerar o QR Code</span>
            <span>2. Escanear no WhatsApp</span>
            <span>3. Aguardar a conexão</span>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {success}
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-5">
            <article className="rounded-[1.8rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Restaurante
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {activeData.tenant.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Instância usada pelo sistema: {activeData.tenant.slug}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${statusTone(
                    currentState
                  )}`}
                >
                  {statusLabel(currentState)}
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => runAction(basePath, 'POST', 'Instância garantida e QR Code gerado.')}
                  className="rounded-2xl border border-amber-300/40 bg-amber-300 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Gerar QR Code
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    runAction(
                      `${basePath}/connect`,
                      'POST',
                      'Novo QR Code solicitado.'
                    )
                  }
                  className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 font-semibold text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Gerar novo QR Code
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    runAction(
                      `${basePath}/disconnect`,
                      'POST',
                      'Sessão desconectada.'
                    )
                  }
                  className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 font-semibold text-rose-100 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Desconectar WhatsApp
                </button>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
                  Se o QR expirar ou falhar, toque em "Gerar novo QR Code".
                </div>
              </div>
            </article>

            <article className="grid gap-4 rounded-[1.8rem] border border-white/10 bg-black/20 p-5 backdrop-blur sm:grid-cols-2">
              <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Instância
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {data?.instance.instanceName ?? tenant.slug}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Owner: {data?.instance.owner ?? 'ainda não conectado'}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Perfil
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {data?.instance.profileName ?? 'Sem perfil ativo'}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Status do perfil: {data?.instance.profileStatus ?? 'não informado'}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Webhook
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {data?.instance.webhook?.enabled ? 'Ativo' : 'Não configurado'}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Eventos: {data?.instance.webhook?.events?.join(', ') || '-'}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  Situação
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {data?.instance.exists ? 'Instância pronta no backend' : 'Instância ainda não criada'}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  O painel consulta o estado a cada 8 segundos.
                </p>
              </div>
            </article>
          </div>

          <article className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              QR Code de conexão
            </p>
            <div className="mt-5 flex min-h-[28rem] flex-col items-center justify-center rounded-[1.8rem] border border-dashed border-white/12 bg-[#f7f1e5] p-6 text-center">
              {data?.instance.qr?.dataUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.instance.qr.dataUrl}
                    alt="QR Code para conectar o WhatsApp"
                    className="h-64 w-64 rounded-[1.5rem] bg-white p-4 shadow-[0_18px_45px_rgba(0,0,0,0.16)]"
                  />
                  <p className="mt-6 font-[family:var(--font-display)] text-3xl text-zinc-900">
                    {data.instance.qr.pairingCode ?? 'QR pronto para leitura'}
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-600">
                    Abra o WhatsApp no celular do restaurante, toque em dispositivos conectados e escaneie este QR Code.
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Tentativa {data.instance.qr.attempts ?? 1}
                  </p>
                </>
              ) : currentState === 'open' ? (
                <div className="max-w-sm space-y-3">
                  <p className="font-[family:var(--font-display)] text-4xl text-zinc-900">
                    WhatsApp conectado
                  </p>
                  <p className="text-sm leading-6 text-zinc-600">
                    A sessão já está aberta. Se quiser trocar o aparelho, desconecte e gere um novo QR.
                  </p>
                </div>
              ) : (
                <div className="max-w-sm space-y-3">
                  <p className="font-[family:var(--font-display)] text-4xl text-zinc-900">
                    Pronto para conectar
                  </p>
                  <p className="text-sm leading-6 text-zinc-600">
                    Basta tocar em "Gerar QR Code" para iniciar o pareamento do WhatsApp do restaurante.
                  </p>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
