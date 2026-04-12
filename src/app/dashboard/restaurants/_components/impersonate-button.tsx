'use client';

export function ImpersonateButton({ tenantId }: { tenantId: string }) {
  const handleClick = async () => {
    await fetch('/api/admin/impersonate', {
      method: 'POST',
      body: JSON.stringify({ tenantId }),
      headers: { 'Content-Type': 'application/json' },
    });
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
