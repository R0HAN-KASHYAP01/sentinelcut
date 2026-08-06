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
    <header className="h-14 border-b border-border-subtle bg-bg-surface flex items-center justify-end px-6">
      <button
        onClick={handleLogout}
        className="text-sm text-text-secondary hover:text-accent-rose"
      >
        Log out
      </button>
    </header>
  );
}