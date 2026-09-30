// frontend/src/app/(app)/files/[fileId]/editor/page.js
'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { btnPrimary, btnSecondary } from '@/components/ui/primitives';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'removed', label: 'Removed' },
];

const SEVERITY_STYLES = {
  high: 'bg-rose-50 text-rose-700 ring-rose-200',
  medium: 'bg-amber-50 text-amber-800 ring-amber-200',
  low: 'bg-teal-50 text-teal-800 ring-teal-200',
};

function Icon({ d, className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function SeverityBadge({ severity }) {
  const key = String(severity || '').toLowerCase();
  const style = SEVERITY_STYLES[key] || 'bg-stone-100 text-stone-600 ring-stone-200';
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ring-1 ${style}`}>
      {severity || 'unknown'}
    </span>
  );
}

function formatTime(seconds) {
  const s = Math.max(0, Number(seconds) || 0);
  const m = Math.floor(s / 60);
  const rest = (s % 60).toFixed(2).padStart(5, '0');
  return `${m}:${rest}`;
}

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const fileId = params.fileId;

  const [file, setFile] = useState(null);
  const [detections, setDetections] = useState([]);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [downloading, setDownloading] = useState('');
  const [filter, setFilter] = useState('all');
  const [changedIds, setChangedIds] = useState(() => new Set());

  const loadData = useCallback(async () => {
    try {
      const [fileData, detectionsData] = await Promise.all([
        api.get(`/files/${fileId}`),
        api.get(`/files/${fileId}/detections`),
      ]);
      setFile(fileData);
      setDetections([...detectionsData].sort((a, b) => a.start - b.start));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    if (fileId) loadData();
  }, [fileId, loadData]);

  const handleToggleStatus = async (detection) => {
    const newStatus = detection.status === 'active' ? 'removed' : 'active';
    setError('');
    try {
      const updated = await api.patch(`/detections/${detection.id}`, { status: newStatus });
      setDetections((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      if (selectedDetection?.id === updated.id) setSelectedDetection(updated);
      // Track unsaved-to-output changes; toggling back clears the flag.
      setChangedIds((prev) => {
        const next = new Set(prev);
        if (next.has(updated.id)) next.delete(updated.id);
        else next.add(updated.id);
        return next;
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError('');
    try {
      await api.post(`/files/${fileId}/recensor`);
      // Redirect to processing, which auto-redirects back here once done.
      router.push(`/files/${fileId}/processing?returnTo=editor`);
    } catch (err) {
      setError(err.message);
      setRegenerating(false);
    }
  };

  const handleDownloadVideo = async () => {
    setDownloading('video');
    setError('');
    try {
      const { url } = await api.get(`/files/${fileId}/export/video`);
      window.open(url, '_blank'); // signed URL, no auth header needed
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading('');
    }
  };

  const handleDownloadTranscript = async () => {
    setDownloading('transcript');
    setError('');
    try {
      await api.download(`/files/${fileId}/export/transcript`, `transcript_${fileId}.txt`);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading('');
    }
  };

  const handleDownloadDetections = async () => {
    setDownloading('detections');
    setError('');
    try {
      await api.download(`/files/${fileId}/export/detections`, `detections_${fileId}.json`);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading('');
    }
  };

  const activeCount = detections.filter((d) => d.status === 'active').length;
  const removedCount = detections.length - activeCount;
  const isReady = file?.status === 'done' && file?.censored_storage_path;
  const hasPendingChanges = changedIds.size > 0;

  const visibleDetections = useMemo(
    () => (filter === 'all' ? detections : detections.filter((d) => d.status === filter)),
    [detections, filter]
  );

  // Timeline length: use file duration if the API provides it, else fall back to the last detection.
  const totalDuration = useMemo(() => {
    const fromFile = Number(file?.duration_seconds ?? file?.duration);
    if (fromFile > 0) return fromFile;
    const lastEnd = detections.reduce((max, d) => Math.max(max, d.end || 0), 0);
    return lastEnd > 0 ? lastEnd * 1.05 : 1;
  }, [file, detections]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F6F5] font-sans">
        <div className="flex flex-col items-center gap-4 text-stone-500">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-700" />
          <p className="text-sm">Loading timeline…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#F3F6F5] p-4 font-sans text-stone-900 antialiased sm:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs font-medium text-teal-800 hover:text-teal-950">
            <Icon d="M15 18l-6-6 6-6" className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Timeline <span className="text-teal-700">Editor</span>
          </h1>
          <p className="mt-1 truncate text-sm text-stone-600">
            {file?.original_filename ? `${file.original_filename} · ` : ''}Review and refine AI detections before exporting.
          </p>
        </div>

        <div className="flex gap-2 text-xs">
          <span className="rounded-full bg-white px-3 py-1.5 font-medium text-stone-700 shadow-sm ring-1 ring-stone-200">
            {detections.length} total
          </span>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 font-medium text-amber-800 shadow-sm ring-1 ring-amber-200">
            {activeCount} active
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 font-medium text-stone-500 shadow-sm ring-1 ring-stone-200">
            {removedCount} removed
          </span>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>{error}</span>
          <button onClick={() => setError('')} className="shrink-0 text-rose-500 hover:text-rose-700" aria-label="Dismiss error">
            <Icon d="M6 6l12 12M18 6L6 18" />
          </button>
        </div>
      )}

      {/* Timeline overview */}
      <div className="mb-5 overflow-hidden rounded-2xl bg-teal-950 text-white shadow-xl shadow-teal-950/20">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-2.5 text-xs text-teal-100/80">
          <span className="font-medium">Timeline overview</span>
          <span className="tabular-nums">{formatTime(totalDuration)}</span>
        </div>
        <div className="px-5 py-4">
          <div className="relative h-12 rounded-lg bg-white/5">
            {detections.map((d) => {
              const left = Math.min(99.2, (d.start / totalDuration) * 100);
              const width = Math.max(0.8, ((d.end - d.start) / totalDuration) * 100);
              const isSelected = selectedDetection?.id === d.id;
              const removed = d.status === 'removed';
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDetection(d)}
                  title={`"${d.word}" at ${d.start.toFixed(2)}s`}
                  aria-label={`Select detection ${d.word} at ${d.start.toFixed(2)} seconds`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  className={`absolute inset-y-1.5 rounded transition ${
                    removed ? 'bg-teal-100/25 hover:bg-teal-100/40' : 'bg-amber-400 hover:bg-amber-300'
                  } ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-teal-950' : ''}`}
                />
              );
            })}
          </div>
          <div className="mt-2 flex items-center gap-4 text-[11px] text-teal-100/70">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-amber-400" />Will be censored</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-teal-100/30" />Removed</span>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 lg:flex-row">
        {/* Left: detection list */}
        <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-3">
            <h2 className="text-sm font-semibold">Detections</h2>
            <div className="flex rounded-lg bg-stone-100 p-0.5 text-xs font-medium" role="tablist" aria-label="Filter detections">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  role="tab"
                  aria-selected={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-md px-3 py-1.5 transition ${
                    filter === f.key ? 'bg-white text-teal-800 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {visibleDetections.length === 0 && (
              <p className="p-8 text-center text-sm text-stone-500">
                {detections.length === 0 ? 'No detections found in this file.' : 'No detections match this filter.'}
              </p>
            )}
            {visibleDetections.map((d) => {
              const selected = selectedDetection?.id === d.id;
              const removed = d.status === 'removed';
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDetection(d)}
                  aria-pressed={selected}
                  className={`w-full rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                    selected
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-stone-200 bg-stone-50/60 hover:border-teal-300 hover:bg-white'
                  } ${removed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 font-semibold">
                      <span className={`h-2.5 w-2.5 rounded-full ${removed ? 'bg-stone-300' : 'bg-amber-400'}`} />
                      <span className={removed ? 'line-through decoration-stone-400' : ''}>&ldquo;{d.word}&rdquo;</span>
                      {removed && <span className="text-xs font-normal text-stone-400">removed</span>}
                    </span>
                    <span className="text-xs tabular-nums text-stone-500">
                      {d.start.toFixed(2)}s – {d.end.toFixed(2)}s
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                    <span className="capitalize">{d.language}</span>
                    <SeverityBadge severity={d.severity} />
                    <span>{(d.confidence * 100).toFixed(0)}% confidence</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right: detail + export */}
        <aside className="flex w-full shrink-0 flex-col gap-5 overflow-y-auto lg:w-80">
          {selectedDetection ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-500">Detection details</h3>

              <p className="text-2xl font-bold">&ldquo;{selectedDetection.word}&rdquo;</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-md bg-teal-50 px-2 py-1 tabular-nums text-teal-800">
                  {selectedDetection.start.toFixed(2)}s – {selectedDetection.end.toFixed(2)}s
                </span>
                <span className="capitalize text-stone-500">{selectedDetection.language}</span>
                <SeverityBadge severity={selectedDetection.severity} />
              </div>

              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-stone-600">Confidence</span>
                  <span className="font-semibold">
                    {(selectedDetection.confidence * 100).toFixed(0)}%
                    <span className="ml-1.5 text-xs font-normal capitalize text-stone-500">({selectedDetection.source})</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className={`h-full rounded-full ${selectedDetection.confidence >= 0.85 ? 'bg-rose-500' : 'bg-amber-400'}`}
                    style={{ width: `${Math.round(selectedDetection.confidence * 100)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => handleToggleStatus(selectedDetection)}
                className={`mt-6 w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  selectedDetection.status === 'active'
                    ? 'border-rose-200 bg-white text-rose-700 hover:bg-rose-50'
                    : 'border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100'
                }`}
              >
                {selectedDetection.status === 'active' ? 'Remove (unflag)' : 'Restore (re-flag)'}
              </button>
            </div>
          ) : (
            <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 text-center">
              <p className="text-sm text-stone-500">Select a detection from the list or timeline to see details.</p>
            </div>
          )}

          {/* Export panel */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-500">Export</h3>
            <p className={`mb-4 text-xs ${isReady ? 'text-teal-700' : 'text-amber-700'}`}>
              {isReady
                ? hasPendingChanges
                  ? 'You have changes that are not in the current output. Regenerate first.'
                  : 'Censored output ready for download.'
                : 'Censoring in progress. Export will be available once done.'}
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleDownloadVideo}
                disabled={!isReady || downloading === 'video'}
                className={`${btnPrimary} w-full justify-center disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {downloading === 'video' ? 'Opening…' : 'Download censored audio/video'}
              </button>
              <button
                onClick={handleDownloadTranscript}
                disabled={downloading === 'transcript'}
                className={`${btnSecondary} w-full justify-center disabled:opacity-40`}
              >
                {downloading === 'transcript' ? 'Downloading…' : 'Download transcript (.txt)'}
              </button>
              <button
                onClick={handleDownloadDetections}
                disabled={downloading === 'detections'}
                className={`${btnSecondary} w-full justify-center disabled:opacity-40`}
              >
                {downloading === 'detections' ? 'Downloading…' : 'Download detections (.json)'}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom toolbar */}
      <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-teal-950 px-5 py-4 text-white shadow-xl shadow-teal-950/20 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm">
          <p className="font-medium">{activeCount} active detections</p>
          <p className="text-xs text-teal-100/70">
            {hasPendingChanges
              ? `${changedIds.size} change${changedIds.size > 1 ? 's' : ''} waiting. Regenerate to apply ${changedIds.size > 1 ? 'them' : 'it'}.`
              : 'Output is up to date with your edits.'}
          </p>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className={`rounded-lg px-6 py-2.5 text-sm font-semibold text-teal-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50 ${
            hasPendingChanges ? 'bg-amber-400 hover:bg-amber-300' : 'bg-white/90 hover:bg-white'
          }`}
        >
          {regenerating ? 'Regenerating…' : 'Regenerate Output'}
        </button>
      </div>
    </div>
  );
}