'use client';

import { api } from '@/lib/api-client';
import { useState, useEffect } from 'react';

type TopRestaurant = {
  tenantId: string;
  name: string;
  gmv: number;
  orderCount: number;
};

type Metrics = {
  gmvToday: number;
  gmvMonth: number;
  totalOrders: number;
  totalConversations: number;
  ordersFromConversations: number;
  conversionRate: number;
  topRestaurants: TopRestaurant[];
  disconnectedCount: number;
  aiFailureRate: number;
  avgResponseTimeSec: number;
  totalTenants: number;
  totalCustomers: number;
};

function fmt(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  alert,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        alert
          ? 'border-rose-400/25 bg-rose-500/5'
          : 'border-white/8 bg-white/[0.03]'
      }`}
    >
      <div className="flex items-center gap-2 text-slate-400">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p
        className={`mt-3 text-2xl font-bold ${
          alert ? 'text-rose-300' : 'text-white'
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export function AdminCockpit() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ metrics: Metrics }>('/admin/metrics')
      .then(data => {
        if (data.metrics) setMetrics(data.metrics);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-slate-500 animate-pulse">Carregando metricas...</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-slate-400">Erro ao carregar metricas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-[family:var(--font-display)] text-3xl text-white">
          Cockpit Admin
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Saude da plataforma e valor gerado em tempo real.
        </p>
      </div>

      {/* Orgulho — Growth & Value */}
      <div>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-emerald-400/80">
          Crescimento e Valor
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon="💰"
            label="GMV Hoje"
            value={`R$ ${fmt(metrics.gmvToday)}`}
            sub="Pedidos do dia"
          />
          <MetricCard
            icon="📈"
            label="GMV Mes"
            value={`R$ ${fmt(metrics.gmvMonth)}`}
            sub="Acumulado mensal"
          />
          <MetricCard
            icon="🤖"
            label="Conversao IA"
            value={`${metrics.conversionRate.toFixed(1)}%`}
            sub={`${metrics.ordersFromConversations} de ${metrics.totalConversations} conversas`}
          />
          <MetricCard
            icon="🏪"
            label="Restaurantes"
            value={String(metrics.totalTenants)}
            sub={`${metrics.totalCustomers} clientes finais`}
          />
        </div>
      </div>

      {/* Alerta — Stability */}
      <div>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-rose-400/80">
          Alertas e Estabilidade
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            icon="📵"
            label="Instancias Offline"
            value={String(metrics.disconnectedCount)}
            sub="WhatsApp desconectados"
            alert={metrics.disconnectedCount > 0}
          />
          <MetricCard
            icon="⚠️"
            label="Falha IA"
            value={`${metrics.aiFailureRate.toFixed(1)}%`}
            sub="Taxa de erro nas respostas"
            alert={metrics.aiFailureRate > 5}
          />
          <MetricCard
            icon="⏱️"
            label="Tempo Resposta"
            value={`${metrics.avgResponseTimeSec.toFixed(1)}s`}
            sub="Media de resposta da IA"
            alert={metrics.avgResponseTimeSec > 10}
          />
        </div>
      </div>

      {/* Top 5 Restaurants */}
      <div>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-amber-400/80">
          Top 5 Restaurantes
        </h2>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 text-slate-500">
                <th className="py-3 px-5 text-left font-medium">#</th>
                <th className="py-3 px-5 text-left font-medium">Restaurante</th>
                <th className="py-3 px-5 text-right font-medium">GMV</th>
                <th className="py-3 px-5 text-right font-medium">Pedidos</th>
                <th className="py-3 px-5 text-right font-medium">Acao</th>
              </tr>
            </thead>
            <tbody>
              {metrics.topRestaurants.map((r, i) => (
                <tr
                  key={r.tenantId}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="py-3 px-5 text-slate-500">{i + 1}</td>
                  <td className="py-3 px-5 font-medium text-white">{r.name}</td>
                  <td className="py-3 px-5 text-right text-emerald-300">
                    R$ {fmt(r.gmv)}
                  </td>
                  <td className="py-3 px-5 text-right text-slate-400">
                    {r.orderCount}
                  </td>
                  <td className="py-3 px-5 text-right">
                    <button
                      onClick={async () => {
                        await api.post('/admin/impersonate', { tenantId: r.tenantId });
                        window.location.href = '/dashboard';
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2"
                    >
                      Ver como owner
                    </button>
                  </td>
                </tr>
              ))}
              {metrics.topRestaurants.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Nenhum restaurante encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
