// frontend/src/components/shared/Navbar.jsx
'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';

export default function Navbar() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await api.post('/auth/logout', {});
    } catch (e) {
      // even if the request fails, clear local tokens and redirect
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-end bg-white/80 px-6 shadow-sm backdrop-blur">
      <button
        onClick={handleLogout}
        className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3.5 py-1.5 text-sm font-medium text-stone-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
        Log out
      </button>
    </header>
  );
}