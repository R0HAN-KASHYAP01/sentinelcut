// frontend/src/app/(app)/files/[fileId]/export/page.js
'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { btnPrimary, btnSecondary } from '@/components/ui/primitives';

const BARS = [8, 14, 22, 12, 18, 10];
const CENSORED = new Set([2, 3]);

function Icon({ d, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function LogoBars() {
  return (
    <svg viewBox="0 0 36 28" className="h-14 w-20" aria-hidden="true">
      {BARS.map((h, i) => (
        <rect
          key={i}
          x={i * 6 + 1}
          y={14 - h / 2}
          width="3.5"
          height={h}
          rx="1.75"
          className={CENSORED.has(i) ? 'fill-amber-400' : 'fill-teal-300'}
        />
      ))}
    </svg>
  );
}

const ICONS = {
  media: 'M3 7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM17 10l4-2v8l-4-2',
  transcript: 'M7 8h10M7 12h10M7 16h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z',
  detections: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
  download: 'M12 4v12m0 0l-4-4m4 4l4-4M5 20h14',
};

export default function ExportPage() {
  const params = useParams();
  const fileId = params.fileId;

  const [file, setFile] = useState(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState('');
  const [done, setDone] = useState(() => new Set());

  const loadData = useCallback(async () => {
    try {
      const [fileData, detectionsData] = await Promise.all([
        api.get(`/files/${fileId}`),
        api.get(`/files/${fileId}/detections`),
      ]);
      setFile(fileData);
      setDetections(detectionsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    if (fileId) loadData();
  }, [fileId, loadData]);

  const markDone = (key) => setDone((prev) => new Set(prev).add(key));

  const handleDownloadMedia = async () => {
    setDownloading('media');
    setError('');
    try {
      const { url } = await api.get(`/files/${fileId}/export/video`);
      // Signed URL, so no auth header is needed. A temporary link avoids popup blockers.
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.download = '';
      document.body.appendChild(a);
      a.click();
      a.remove();
      markDone('media');
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
      markDone('transcript');
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
      markDone('detections');
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading('');
    }
  };

  const handleDownloadAll = async () => {
    await handleDownloadTranscript();
    await handleDownloadDetections();
    await handleDownloadMedia();
  };

  const stats = useMemo(() => {
    const active = detections.filter((d) => d.status === 'active').length;
    const languages = new Set(detections.map((d) => d.language).filter(Boolean));
    return { total: detections.length, active, removed: detections.length - active, languages: languages.size };
  }, [detections]);

  const isReady = file?.status === 'done' && Boolean(file?.censored_storage_path);
  const isFailed = file?.status === 'failed';
  const isProcessing = !isReady && !isFailed;

  const items = [
    {
      key: 'media',
      title: 'Censored audio/video',
      body: 'Your file with flagged words replaced. Video keeps its picture.',
      action: handleDownloadMedia,
      disabled: !isReady,
      busyLabel: 'Preparing…',
      label: 'Download file',
      primary: true,
    },
    {
      key: 'transcript',
      title: 'Transcript (.txt)',
      body: 'The full word-timestamped transcript of the recording.',
      action: handleDownloadTranscript,
      disabled: false,
      busyLabel: 'Downloading…',
      label: 'Download transcript',
    },
    {
      key: 'detections',
      title: 'Detections (.json)',
      body: 'Every detection with timing, language, severity and confidence.',
      action: handleDownloadDetections,
      disabled: false,
      busyLabel: 'Downloading…',
      label: 'Download detections',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F6F5] font-sans">
        <div className="flex flex-col items-center gap-4 text-stone-500">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-700" />
          <p className="text-sm">Preparing your export…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F6F5] px-4 py-8 font-sans text-stone-900 antialiased sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/files/${fileId}/editor`}
          className="inline-flex items-center gap-1 text-xs font-medium text-teal-800 hover:text-teal-950"
        >
          <Icon d="M15 18l-6-6 6-6" className="h-3.5 w-3.5" />
          Back to editor
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Export <span className="text-teal-700">your files</span>
        </h1>
        <p className="mt-1 truncate text-sm text-stone-600">{file?.original_filename || 'Your file'}</p>

        {error && (
          <div role="alert" className="mt-5 flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span>{error}</span>
            <button onClick={() => setError('')} className="shrink-0 text-rose-500 hover:text-rose-700" aria-label="Dismiss error">
              <Icon d="M6 6l12 12M18 6L6 18" className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Summary card */}
        <div className="relative mt-6 overflow-hidden rounded-2xl bg-teal-950 text-white shadow-2xl shadow-teal-950/30">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-500/20 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-6 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3 text-xs text-teal-100/80">
            <span className="truncate font-medium">{file?.original_filename || 'Your file'}</span>
            {isFailed ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose-400/15 px-2.5 py-1 text-rose-200">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />Failed
              </span>
            ) : isReady ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-teal-400/15 px-2.5 py-1 text-teal-200">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />Ready
              </span>
            ) : (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-400/15 px-2.5 py-1 text-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 motion-safe:animate-pulse" />Processing
              </span>
            )}
          </div>

          <div className="relative flex flex-col items-center gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <LogoBars />
              <div>
                <p className="text-lg font-semibold">
                  {isFailed ? 'Processing failed' : isReady ? 'Your clean file is ready' : 'Still censoring your file'}
                </p>
                <p className="mt-1 max-w-xs text-sm text-teal-100/80">
                  {isFailed
                    ? 'The censored output could not be created. You can still download the transcript and detections.'
                    : isReady
                    ? `${stats.active} word${stats.active === 1 ? '' : 's'} will be censored in the exported file.`
                    : 'The downloadable file will appear here once processing finishes.'}
                </p>
              </div>
            </div>

            <div className="grid w-full grid-cols-3 gap-3 text-center sm:w-auto">
              {[
                { label: 'Censored', value: stats.active, tone: 'text-amber-300' },
                { label: 'Removed', value: stats.removed, tone: 'text-teal-100' },
                { label: 'Languages', value: stats.languages, tone: 'text-teal-100' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/5 px-4 py-3">
                  <p className={`text-xl font-bold tabular-nums ${s.tone}`}>{s.value}</p>
                  <p className="text-[11px] text-teal-100/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isProcessing && (
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <span>Processing is not finished yet. Check progress, then come back to download.</span>
            <Link href={`/files/${fileId}/processing`} className="font-semibold text-amber-900 underline underline-offset-2">
              View progress
            </Link>
          </div>
        )}

        {/* Download cards */}
        <div className="mt-6 space-y-3">
          {items.map((item) => {
            const busy = downloading === item.key;
            const finished = done.has(item.key);
            return (
              <div
                key={item.key}
                className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <Icon d={ICONS[item.key]} />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold">{item.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">{item.body}</p>
                    {finished && (
                      <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-teal-700">
                        <Icon d="M5 13l4 4L19 7" className="h-3.5 w-3.5" />
                        Download started
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={item.action}
                  disabled={item.disabled || busy || Boolean(downloading)}
                  className={`${item.primary ? btnPrimary : btnSecondary} w-full shrink-0 justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto`}
                >
                  <Icon d={ICONS.download} className="h-4 w-4" />
                  {busy ? item.busyLabel : item.label}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <button
            onClick={handleDownloadAll}
            disabled={!isReady || Boolean(downloading)}
            className="text-sm font-medium text-teal-800 underline underline-offset-2 hover:text-teal-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
          >
            Download everything
          </button>
          <div className="flex items-center gap-4 text-sm">
            <Link href={`/files/${fileId}/editor`} className="font-medium text-stone-600 hover:text-teal-800">
              Edit detections
            </Link>
            <Link href="/upload" className={btnSecondary}>
              Censor another file
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}