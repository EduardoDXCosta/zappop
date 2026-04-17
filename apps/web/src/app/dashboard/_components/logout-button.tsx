'use client';

import { api } from '@/lib/api-client';

export function LogoutButton() {
  return (
    <button
      onClick={async () => {
        try { await api.post('/auth/logout'); } catch { /* ignore */ }
        window.location.href = '/login';
      }}
      className="text-xs text-slate-500 hover:text-slate-300 transition"
    >
      Sair
    </button>
  );
}
