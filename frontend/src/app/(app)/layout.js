// frontend/src/app/(app)/layout.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import Navbar from '@/components/shared/Navbar';

export default function AppLayout({ children }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    // Matches the page background so there is no white flash during the redirect check.
    return <div className="min-h-screen bg-[#F3F6F5]" aria-busy="true" />;
  }

  return (
    <div className="flex min-h-screen bg-[#F3F6F5]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        {/* Pages use <PageShell>, which already adds its own padding and background. */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}