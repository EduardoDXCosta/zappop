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
    setData((prev) => {
      const newPayload = payload as StatusResponse;
      // Impede que o polling do status apague a imagem QR que foi obtida via POST momentaneamente
      if (
        prev &&
        prev.instance?.qr &&
        newPayload.instance?.qr === null &&
        newPayload.instance?.connectionState !== 'open'
      ) {
        return {
          ...newPayload,
          instance: {
            ...newPayload.instance,
            qr: prev.instance.qr,
          },
        };
      }
      return newPayload;
    });
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
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)] opacity-60" />
      <div className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-[family:var(--font-display)] text-3xl leading-tight text-white sm:text-4xl">
              Conecte o WhatsApp do restaurante
            </h1>
            <p className="text-sm text-slate-400">
              Vincule o WhatsApp para ativar o atendimento automatico.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${statusTone(
              currentState
            )}`}
          >
            <span className={`inline-block h-2 w-2 rounded-full ${
              currentState === 'open' ? 'bg-emerald-400' : currentState === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-white/40'
            }`} />
            {statusLabel(currentState)}
          </span>
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

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-5">
            <article className="rounded-[1.8rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/75">
                📱 Como conectar
              </p>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-300/15 text-xs font-bold text-amber-200">1</span>
                  <span>Toque no botao <strong className="text-white">&quot;Gerar QR Code&quot;</strong> abaixo</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-300/15 text-xs font-bold text-amber-200">2</span>
                  <span>Abra o <strong className="text-white">WhatsApp</strong> no celular do restaurante</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-300/15 text-xs font-bold text-amber-200">3</span>
                  <span>Va em <strong className="text-white">Configuracoes → Dispositivos conectados → Conectar dispositivo</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-300/15 text-xs font-bold text-amber-200">4</span>
                  <span>Aponte a camera do celular para o <strong className="text-white">QR Code</strong> que vai aparecer ao lado</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-xs font-bold text-emerald-200">✓</span>
                  <span>Pronto! A conexao acontece em segundos</span>
                </li>
              </ol>
            </article>

            <div className="space-y-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => runAction(basePath, 'POST', 'QR Code gerado! Escaneie com o WhatsApp.')}
                className="w-full rounded-2xl border border-amber-300/40 bg-amber-300 px-4 py-4 text-base font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? 'Gerando...' : 'Gerar QR Code'}
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    runAction(
                      `${basePath}/connect`,
                      'POST',
                      'Novo QR Code gerado!'
                    )
                  }
                  className="flex-1 rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  QR expirou? Gerar outro
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    runAction(
                      `${basePath}/disconnect`,
                      'POST',
                      'WhatsApp desconectado.'
                    )
                  }
                  className="rounded-2xl border border-rose-400/20 bg-rose-500/8 px-4 py-3 text-sm font-medium text-rose-300 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Desconectar
                </button>
              </div>
            </div>
          </div>

          <article className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              QR Code de conexao
            </p>
            <div className="mt-4 flex min-h-[26rem] flex-col items-center justify-center rounded-[1.8rem] border border-dashed border-white/12 bg-[#f7f1e5] p-6 text-center">
              {data?.instance.qr?.dataUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.instance.qr.dataUrl}
                    alt="QR Code para conectar o WhatsApp"
                    className="h-56 w-56 rounded-[1.5rem] bg-white p-3 shadow-[0_18px_45px_rgba(0,0,0,0.16)] sm:h-64 sm:w-64 sm:p-4"
                  />
                  <p className="mt-5 font-[family:var(--font-display)] text-2xl text-zinc-900 sm:text-3xl">
                    Escaneie com o WhatsApp
                  </p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-600">
                    Abra o WhatsApp no celular, va em dispositivos conectados e aponte a camera para este QR Code.
                  </p>
                </>
              ) : currentState === 'open' ? (
                <div className="max-w-sm space-y-3">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
                    ✅
                  </div>
                  <p className="font-[family:var(--font-display)] text-3xl text-zinc-900 sm:text-4xl">
                    WhatsApp conectado!
                  </p>
                  <p className="text-sm leading-6 text-zinc-600">
                    Tudo certo! O atendimento automatico ja esta funcionando. Se precisar trocar de aparelho, desconecte e gere um novo QR Code.
                  </p>
                </div>
              ) : (
                <div className="max-w-sm space-y-3">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
                    📱
                  </div>
                  <p className="font-[family:var(--font-display)] text-3xl text-zinc-900 sm:text-4xl">
                    Pronto para conectar
                  </p>
                  <p className="text-sm leading-6 text-zinc-600">
                    Toque em &quot;Gerar QR Code&quot; ao lado para comecar a vincular o WhatsApp do restaurante.
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
