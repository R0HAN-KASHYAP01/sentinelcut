'use client';

// frontend/src/app/(app)/dashboard/page.js
import { useState, useEffect } from 'react';
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
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function TrashIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

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
        if (!cancelled) setFiles(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    // Light polling so in-progress files update without a manual refresh.
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const linkFor = (file) => {
    if (file.status === 'done') return `/files/${file.id}/editor`;
    if (file.status === 'failed') return `/upload`;
    return `/files/${file.id}/processing`;
  };

  async function handleDelete(e, file) {
    // The button lives inside a <Link>, so stop the click from
    // triggering navigation.
    e.preventDefault();
    e.stopPropagation();

    if (confirmingId !== file.id) {
      setConfirmingId(file.id);
      setDeleteError('');
      return;
    }

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

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0D10] p-6 sm:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-[#9AA1AC]">Your recent files and their status.</p>
          </div>
          <Link
            href="/upload"
            className="text-sm font-medium py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            + Upload new file
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm">
            {error}
          </div>
        )}

        {deleteError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm">
            {deleteError}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : files.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center">
            <p className="text-gray-500 mb-4">No files yet.</p>
            <Link href="/upload" className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline">
              Upload your first file →
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            {files.map((file, i) => (
              <Link
                key={file.id}
                href={linkFor(file)}
                className={`flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                  i !== files.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                }`}
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {file.original_filename}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(file.created_at)}</p>
                </div>

                <div className="ml-4 flex shrink-0 items-center gap-2">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      STATUS_STYLES[file.status] || STATUS_STYLES.uploaded
                    }`}
                  >
                    {STATUS_LABELS[file.status] || file.status}
                  </span>

                  {confirmingId === file.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, file)}
                        disabled={deletingId === file.id}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-60"
                      >
                        {deletingId === file.id ? 'Deleting…' : 'Confirm'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelConfirm}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, file)}
                      aria-label={`Delete ${file.original_filename}`}
                      title="Delete file"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}