'use client';

export function LogoutButton() {
  return (
    <button
      onClick={async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
      }}
      className="text-xs text-slate-500 hover:text-slate-300 transition"
    >
      Sair
    </button>
  );
}
