// frontend/src/app/(app)/history/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import {
  PageShell, PageHeader, StatusBadge, ErrorBanner, SkeletonRows, FileIcon,
  btnPrimary, inputCls, formatDate, fileLink,
} from '@/components/ui/primitives';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'done', label: 'Ready' },
  { value: 'processing', label: 'Processing' },
  { value: 'uploaded', label: 'Queued' },
  { value: 'failed', label: 'Failed' },
];

export default function HistoryPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get('/dashboard/recent-files?limit=100');
        setFiles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => files.filter((f) => {
    const matchesSearch = f.original_filename.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [files, search, statusFilter]);

  return (
    <PageShell>
      <PageHeader
        title="History"
        subtitle="Every file you've processed."
        action={<Link href="/upload" className={btnPrimary}>Upload file</Link>}
      />

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative md:max-w-xs md:flex-1">
          <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-stone-400">
            <path d="M8.5 3a5.5 5.5 0 014.4 8.8l3.6 3.6-1.1 1.1-3.6-3.6A5.5 5.5 0 118.5 3zm0 1.5a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename"
            aria-label="Search by filename"
            className={`${inputCls} pl-9`}
          />
        </div>

        <div role="tablist" aria-label="Filter by status" className="flex gap-1 overflow-x-auto rounded-xl bg-stone-100 p-1">
          {FILTERS.map((f) => {
            const on = statusFilter === f.value;
            return (
              <button
                key={f.value}
                role="tab"
                aria-selected={on}
                onClick={() => setStatusFilter(f.value)}
                className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  on ? 'bg-teal-700 font-semibold text-white shadow-sm' : 'text-stone-600 hover:bg-white hover:text-stone-900'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <ErrorBanner>{error}</ErrorBanner>

      {loading ? (
        <SkeletonRows count={6} />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-teal-200 bg-white px-6 py-14 text-center">
          <p className="text-base font-semibold text-stone-900">No files match</p>
          <p className="mt-1 text-sm text-stone-500">Clear the search or pick a different status.</p>
          {(search || statusFilter !== 'all') && (
            <button onClick={() => { setSearch(''); setStatusFilter('all'); }} className="mt-4 text-sm font-medium text-teal-700 hover:text-teal-900">
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((file) => (
            <li key={file.id}>
              <Link
                href={fileLink(file)}
                className="group flex items-center gap-4 rounded-xl border border-stone-200 bg-white px-4 py-3.5 shadow-sm transition hover:-translate-y-px hover:border-teal-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 sm:px-5"
              >
                <FileIcon name={file.original_filename} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-900 group-hover:text-teal-800">{file.original_filename}</p>
                  <p className="mt-0.5 text-xs text-stone-500">{formatDate(file.created_at, true)}</p>
                </div>
                <StatusBadge status={file.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!loading && (
        <p className="mt-4 text-xs text-stone-500">
          Showing {filtered.length} of {files.length} files
        </p>
      )}
    </PageShell>
  );
}