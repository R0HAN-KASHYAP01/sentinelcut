'use client';

// frontend/src/app/(app)/history/page.js
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

const STATUS_STYLES = {
  uploaded: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  processing: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  failed: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
};

const STATUS_LABELS = {
  uploaded: 'Queued',
  processing: 'Processing',
  done: 'Done',
  failed: 'Failed',
};

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

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

  const filtered = useMemo(() => {
    return files.filter((f) => {
      const matchesSearch = f.original_filename.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [files, search, statusFilter]);

  const linkFor = (file) => {
    if (file.status === 'done') return `/files/${file.id}/editor`;
    if (file.status === 'failed') return `/upload`;
    return `/files/${file.id}/processing`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0D10] p-6 sm:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">History</h1>
          <p className="text-sm text-gray-500 dark:text-[#9AA1AC]">
            Full history of every file you've processed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename…"
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
          >
            <option value="all">All statuses</option>
            <option value="done">Done</option>
            <option value="processing">Processing</option>
            <option value="uploaded">Queued</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center">
            <p className="text-gray-500">No files match your filters.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            {filtered.map((file, i) => (
              <Link
                key={file.id}
                href={linkFor(file)}
                className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                  i !== filtered.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                }`}
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {file.original_filename}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(file.created_at)}</p>
                </div>
                <span
                  className={`ml-4 shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                    STATUS_STYLES[file.status] || STATUS_STYLES.uploaded
                  }`}
                >
                  {STATUS_LABELS[file.status] || file.status}
                </span>
              </Link>
            ))}
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">
          Showing {filtered.length} of {files.length} files.
        </p>
      </div>
    </div>
  );
}