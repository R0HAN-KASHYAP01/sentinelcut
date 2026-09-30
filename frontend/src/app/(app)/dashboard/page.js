'use client';

// frontend/src/app/(app)/dashboard/page.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import {
  PageShell, PageHeader, StatusBadge, ErrorBanner, SkeletonRows, EmptyState,
  Waveform, FileIcon, btnPrimary, btnSecondary, btnOnDark, formatDate, fileLink,
} from '@/components/ui/primitives';

function TrashIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
    </svg>
  );
}

const STEPS = ['Upload', 'AI detects profanity', 'Automatic beep', 'Export'];

// Accent colour per stat so the numbers scan at a glance.
const STAT_STYLE = {
  Files: 'bg-stone-400',
  'In progress': 'bg-amber-500',
  'Ready to export': 'bg-teal-600',
  Failed: 'bg-red-500',
};

export default function DashboardPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await api.get('/dashboard/recent-files?limit=20');
        if (!cancelled) { setFiles(data); setError(''); }
      } catch (err) {
        if (!cancelled) {
          setError(err.message === 'Failed to fetch'
            ? 'Cannot reach the server. Check that the backend is running.'
            : err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    // Light polling so in-progress files update without a manual refresh.
    const interval = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  async function handleDelete(e, file) {
    // The button lives inside a <Link>, so stop the click from navigating.
    e.preventDefault();
    e.stopPropagation();
    if (confirmingId !== file.id) { setConfirmingId(file.id); setDeleteError(''); return; }
    setDeletingId(file.id);
    setDeleteError('');
    try {
      await api.delete(`/files/${file.id}`);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete file.');
    } finally {
      setDeletingId(null);
      setConfirmingId(null);
    }
  }

  function handleCancelConfirm(e) {
    e.preventDefault();
    e.stopPropagation();
    setConfirmingId(null);
  }

  const count = (s) => files.filter((f) => f.status === s).length;
  const active = count('processing') + count('uploaded') + count('pending');
  const stats = [
    { label: 'Files', value: files.length },
    { label: 'In progress', value: active },
    { label: 'Ready to export', value: count('done') },
    { label: 'Failed', value: count('failed') },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        subtitle="Your recent files and their status."
        action={<Link href="/upload" className={btnPrimary}>Upload file</Link>}
      />

      {/* Hero: deep teal panel; the pulsing amber bars are the "beeped" moments */}
      <section className="relative mb-8 overflow-hidden rounded-2xl bg-teal-950 text-white shadow-xl shadow-teal-950/20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-8 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="max-w-md">
            <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              Upload audio or video. AI handles the censoring.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-teal-100/80">
              Profanity is found, timestamped and beeped automatically. You review before you export.
            </p>
            <Link href="/upload" className={`${btnOnDark} mt-6`}>Choose a file</Link>
          </div>
          <Waveform tone="dark" className="h-24 w-full sm:h-28 sm:w-80" />
        </div>

        <ol className="relative grid grid-cols-2 border-t border-white/10 bg-black/20 text-xs text-teal-50/90 sm:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2.5 px-5 py-3.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[11px] font-semibold text-teal-950">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </section>

      {!loading && files.length > 0 && (
        <dl className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
              <dt className="flex items-center gap-2 text-xs font-medium text-stone-500">
                <span className={`h-2 w-2 rounded-full ${STAT_STYLE[s.label]}`} />
                {s.label}
              </dt>
              <dd className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-stone-900">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-stone-900">Recent files</h2>
        <Link href="/history" className="text-sm font-medium text-teal-700 hover:text-teal-900">View all</Link>
      </div>

      <ErrorBanner>{error}</ErrorBanner>
      <ErrorBanner>{deleteError}</ErrorBanner>

      {loading ? (
        <SkeletonRows />
      ) : files.length === 0 && !error ? (
        <EmptyState
          title="No files yet"
          body="Upload an MP3, WAV or MP4 and the first detection run starts right away."
          href="/upload"
          cta="Upload your first file"
        />
      ) : (
        <ul className="space-y-2.5">
          {files.map((file) => (
            <li key={file.id}>
              <Link
                href={fileLink(file)}
                className="group flex items-center gap-4 rounded-xl border border-stone-200 bg-white px-4 py-3.5 shadow-sm transition hover:-translate-y-px hover:border-teal-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 sm:px-5"
              >
                <FileIcon name={file.original_filename} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-900 group-hover:text-teal-800">{file.original_filename}</p>
                  <p className="mt-0.5 text-xs text-stone-500">{formatDate(file.created_at)}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={file.status} />
                  {confirmingId === file.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, file)}
                        disabled={deletingId === file.id}
                        className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                      >
                        {deletingId === file.id ? 'Deleting…' : 'Delete'}
                      </button>
                      <button type="button" onClick={handleCancelConfirm} className={`${btnSecondary} !px-2.5 !py-1 text-xs`}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, file)}
                      aria-label={`Delete ${file.original_filename}`}
                      title="Delete file"
                      className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}