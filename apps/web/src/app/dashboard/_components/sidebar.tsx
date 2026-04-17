'use client';

import { api } from '@/lib/api-client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogoutButton } from './logout-button';

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const ownerNav: NavItem[] = [
  { href: '/dashboard', label: 'Visao Geral', icon: '📊' },
  { href: '/dashboard/conversations', label: 'Conversas', icon: '💬' },
  { href: '/dashboard/menu', label: 'Cardapio', icon: '🍔' },
  { href: '/dashboard/whatsapp', label: 'WhatsApp', icon: '📱' },
  { href: '/dashboard/test-chat', label: 'Modo Teste', icon: '🧪' },
  { href: '/dashboard/settings', label: 'Configuracoes', icon: '⚙️' },
];

const adminNav: NavItem[] = [
  { href: '/dashboard', label: 'Metricas', icon: '📊' },
  { href: '/dashboard/restaurants', label: 'Restaurantes', icon: '🏪' },
  { href: '/dashboard/global-products', label: 'Galeria Global', icon: '📦' },
];

interface SidebarProps {
  role: 'admin' | 'owner';
  tenantName: string | null;
  userName: string | null;
  impersonating?: boolean;
}

export function Sidebar({ role, tenantName, userName, impersonating }: SidebarProps) {
  const pathname = usePathname();
  const items = role === 'admin' ? adminNav : ownerNav;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-white/8 bg-[#0d0f16]">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 border-b border-white/8 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/15 text-lg">
          🍽️
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white">WhatsMenu</span>
          <span className="text-[11px] text-slate-500">
            {role === 'admin' ? 'Painel Admin' : tenantName ?? 'Restaurante'}
          </span>
        </div>
      </div>

      {/* Impersonation banner */}
      {impersonating && tenantName && (
        <div className="mx-3 mt-3 rounded-xl border border-amber-400/25 bg-amber-400/8 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
            Visualizando como
          </p>
          <p className="mt-0.5 text-xs font-semibold text-amber-100 truncate">
            {tenantName}
          </p>
          <button
            onClick={async () => {
              try { await api.delete('/admin/impersonate'); } catch { /* ignore */ }
              window.location.href = '/dashboard';
            }}
            className="mt-1.5 inline-block text-[11px] text-amber-400 underline underline-offset-2 hover:text-amber-300 cursor-pointer"
          >
            Voltar ao Admin
          </button>
        </div>
      )}

      {/* Nav items */}
      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {items.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-amber-400/12 text-amber-200'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }
              `}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/8 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
            {(userName ?? 'U')[0].toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-white truncate max-w-[140px]">
              {userName ?? 'Usuario'}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              {role === 'admin' ? 'Admin' : 'Owner'}
            </span>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
