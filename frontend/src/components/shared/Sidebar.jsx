// frontend/src/components/shared/Sidebar.jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10' },
  { label: 'Upload', href: '/upload', icon: 'M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3' },
  { label: 'History', href: '/history', icon: 'M12 7v5l3 2M21 12a9 9 0 11-3-6.7M21 4v5h-5' },
  { label: 'Settings', href: '/settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z' },
];

// Brand mark: a mini waveform where the amber bars are the "beeped" moments.
const BARS = [8, 14, 22, 12, 18, 10];
const CENSORED = new Set([2, 3]);

function Logo() {
  return (
    <Link href="/dashboard" className="mb-8 flex items-center gap-3 rounded-lg px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-950 shadow-md shadow-teal-950/30">
        <svg viewBox="0 0 36 28" className="h-6 w-6" aria-hidden="true">
          {BARS.map((h, i) => (
            <rect key={i} x={i * 6 + 1} y={14 - h / 2} width="3.5" height={h} rx="1.75"
              className={CENSORED.has(i) ? 'fill-amber-400' : 'fill-teal-300'} />
          ))}
        </svg>
      </span>
      <span className="hidden text-xl font-bold tracking-tight text-stone-900 md:inline">
        Sentinel<span className="text-teal-700">Cut</span>
      </span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col bg-white p-3 shadow-[2px_0_12px_-4px_rgba(15,61,58,0.12)] md:w-60 md:p-4">
      <Logo />
      <nav className="space-y-1.5" aria-label="Main">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              title={item.label}
              className={`flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 md:justify-start ${
                isActive
                  ? 'bg-teal-700 text-white shadow-md shadow-teal-900/20'
                  : 'text-stone-600 hover:bg-teal-50 hover:text-teal-800'
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={item.icon} />
              </svg>
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}