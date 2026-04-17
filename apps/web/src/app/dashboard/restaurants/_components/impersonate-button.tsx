'use client';

import { api } from '@/lib/api-client';

export function ImpersonateButton({ tenantId }: { tenantId: string }) {
  const handleClick = async () => {
    try { await api.post('/admin/impersonate', { tenantId }); } catch { /* ignore */ }
    window.location.href = '/dashboard';
  };

  return (
    <button
      onClick={handleClick}
      className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-2"
    >
      Impersonar
    </button>
  );
}
