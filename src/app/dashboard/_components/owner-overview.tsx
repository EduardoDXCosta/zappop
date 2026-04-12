'use client';

import type { Tenant } from '@/lib/db/types';
import Link from 'next/link';

interface OwnerOverviewProps {
  tenant: Tenant;
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 text-slate-400">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export function OwnerOverview({ tenant }: OwnerOverviewProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-[family:var(--font-display)] text-3xl text-white">
          Ola, {tenant.name}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Gerencie seu restaurante de um so lugar.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="📱"
          label="WhatsApp"
          value={tenant.whatsappCustomerNumber ?? 'Nao conectado'}
          sub="Status da conexao"
        />
        <StatCard
          icon="⏱️"
          label="Tempo de preparo"
          value={`${tenant.waitingTimeMinutes} min`}
        />
        <StatCard
          icon="💰"
          label="Plano"
          value={tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
          sub={tenant.planStatus}
        />
        <StatCard
          icon="🚗"
          label="Entrega"
          value={tenant.deliveryEnabled ? 'Ativa' : 'Somente retirada'}
          sub={
            tenant.deliveryEnabled
              ? `R$ ${tenant.deliveryFee.toFixed(2).replace('.', ',')}`
              : undefined
          }
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">
          Acoes rapidas
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/dashboard/menu"
            className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 transition hover:bg-white/[0.06]"
          >
            <span className="text-xl">🍔</span>
            <div>
              <p className="text-sm font-semibold text-white">Cardapio</p>
              <p className="text-xs text-slate-500">Editar itens e precos</p>
            </div>
          </Link>
          <Link
            href="/dashboard/whatsapp"
            className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 transition hover:bg-white/[0.06]"
          >
            <span className="text-xl">📱</span>
            <div>
              <p className="text-sm font-semibold text-white">WhatsApp</p>
              <p className="text-xs text-slate-500">Conexao e QR Code</p>
            </div>
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 transition hover:bg-white/[0.06]"
          >
            <span className="text-xl">⚙️</span>
            <div>
              <p className="text-sm font-semibold text-white">Configuracoes</p>
              <p className="text-xs text-slate-500">Horarios, entrega, pagamento</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
