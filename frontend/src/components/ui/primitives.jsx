// components/ui/primitives.jsx
// Shared, light-theme building blocks. Accent = teal (actions), amber = censored.
import Link from 'next/link';

export const STATUS = {
  uploaded:   { label: 'Queued',     dot: 'bg-stone-400',               cls: 'bg-stone-100 text-stone-700 ring-stone-200' },
  pending:    { label: 'Queued',     dot: 'bg-stone-400',               cls: 'bg-stone-100 text-stone-700 ring-stone-200' },
  processing: { label: 'Processing', dot: 'bg-amber-500 animate-pulse', cls: 'bg-amber-50 text-amber-800 ring-amber-200' },
  done:       { label: 'Ready',      dot: 'bg-teal-600',                cls: 'bg-teal-50 text-teal-800 ring-teal-200' },
  failed:     { label: 'Failed',     dot: 'bg-red-500',                 cls: 'bg-red-50 text-red-700 ring-red-200' },
};

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-teal-900/20 transition hover:-translate-y-px hover:bg-teal-800 active:translate-y-0 active:bg-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
// Button for dark (teal-950) surfaces.
export const btnOnDark =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-teal-950 shadow-lg shadow-black/20 transition hover:-translate-y-px hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-950';
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-50';
export const inputCls =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20';

export function formatDate(iso, withYear = false) {
  return new Date(iso).toLocaleString(undefined, {
    ...(withYear ? { year: 'numeric' } : {}),
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function fileLink(file) {
  if (file.status === 'done') return `/files/${file.id}/editor`;
  if (file.status === 'failed') return '/upload';
  return `/files/${file.id}/processing`;
}

export function PageShell({ children, width = 'max-w-5xl' }) {
  return (
    <div className="relative min-h-screen bg-[#F3F6F5] font-sans text-stone-900 antialiased">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-teal-100/60 to-transparent" />
      <div className={`relative mx-auto ${width} px-4 py-8 sm:px-8 sm:py-10`}>{children}</div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-stone-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.uploaded;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {STATUS[status] ? s.label : status}
    </span>
  );
}

export function ErrorBanner({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
      <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 fill-current"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-.75 4h1.5v5h-1.5V6zm0 6.5h1.5V14h-1.5v-1.5z" /></svg>
      <span>{children}</span>
    </div>
  );
}

export function SkeletonRows({ count = 4 }) {
  return (
    <div className="space-y-2.5" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-stone-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 animate-pulse rounded bg-stone-100" />
            <div className="h-3 w-1/5 animate-pulse rounded bg-stone-100" />
          </div>
          <div className="h-6 w-20 animate-pulse rounded-full bg-stone-100" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, body, href, cta }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-teal-200 bg-white px-6 py-14 text-center">
      <Waveform className="mx-auto mb-5 h-10 w-44" />
      <p className="text-base font-semibold text-stone-900">{title}</p>
      {body && <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500">{body}</p>}
      {href && <Link href={href} className={`${btnPrimary} mt-6`}>{cta}</Link>}
    </div>
  );
}

// Decorative waveform; amber bars = censored (beeped) segments, which pulse.
const BARS = [6,10,16,9,22,28,14,8,18,26,12,7,20,30,16,9,13,24,11,6,17,21,10,8];
const CENSORED = new Set([5, 6, 15, 16]);
export function Waveform({ className = '', bars = BARS, tone = 'light' }) {
  const base = tone === 'dark' ? 'fill-teal-400/50' : 'fill-stone-300';
  return (
    <svg viewBox={`0 0 ${bars.length * 6} 32`} className={className} aria-hidden="true" preserveAspectRatio="none">
      {bars.map((h, i) => (
        <rect key={i} x={i * 6 + 1} y={16 - h / 2} width="3" height={h} rx="1.5"
          className={CENSORED.has(i) ? 'fill-amber-400 motion-safe:animate-pulse' : base} />
      ))}
    </svg>
  );
}

export function FileIcon({ name = '' }) {
  const isAudio = /\.(mp3|wav|m4a|aac|ogg)$/i.test(name);
  const tone = isAudio ? 'bg-teal-50 text-teal-700' : 'bg-indigo-50 text-indigo-600';
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {isAudio
          ? <><path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2" /></>
          : <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 9.5v5l4-2.5-4-2.5z" /></>}
      </svg>
    </span>
  );
}