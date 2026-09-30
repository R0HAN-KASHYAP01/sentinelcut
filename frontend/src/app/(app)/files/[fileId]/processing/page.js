// frontend/src/app/(app)/files/[fileId]/processing/page.js
'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useJobStatus } from '@/hooks/useJobStatus';
import { btnPrimary, btnSecondary } from '@/components/ui/primitives';

const BARS = [8, 14, 22, 12, 18, 10];
const CENSORED = new Set([2, 3]);

const STAGES = [
  { key: 'uploaded', label: 'Queued', hint: 'Waiting for a worker to pick up your file.' },
  { key: 'processing', label: 'Analyzing', hint: 'Transcribing speech and detecting profanity word by word.' },
  { key: 'done', label: 'Ready', hint: 'Opening the timeline editor.' },
];

function Icon({ d, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

// Animated bars in the same style as the SentinelCut logo mark.
function WorkingBars() {
  return (
    <svg viewBox="0 0 36 28" className="h-16 w-20" aria-hidden="true">
      {BARS.map((h, i) => (
        <rect
          key={i}
          x={i * 6 + 1}
          y={14 - h / 2}
          width="3.5"
          height={h}
          rx="1.75"
          className={`${CENSORED.has(i) ? 'fill-amber-400' : 'fill-teal-300'} motion-safe:animate-pulse`}
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </svg>
  );
}

export default function ProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const fileId = params.fileId;

  const { status, file, error } = useJobStatus(fileId);

  useEffect(() => {
    if (status === 'done') {
      router.push(`/files/${fileId}/editor`);
    }
  }, [status, fileId, router]);

  const failed = status === 'failed' || Boolean(error);
  const currentIndex = Math.max(
    0,
    STAGES.findIndex((s) => s.key === status)
  );
  const currentStage = STAGES[currentIndex];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F6F5] px-4 py-10 font-sans text-stone-900 antialiased">
      <div className="w-full max-w-lg">
        <div className="relative overflow-hidden rounded-2xl bg-teal-950 text-white shadow-2xl shadow-teal-950/30">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-500/20 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-6 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />

          {/* Header row: filename + state badge */}
          <div className="relative flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3 text-xs text-teal-100/80">
            <span className="truncate font-medium">{file?.original_filename || 'Your file'}</span>
            {failed ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose-400/15 px-2.5 py-1 text-rose-200">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />Failed
              </span>
            ) : (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-teal-400/15 px-2.5 py-1 text-teal-200">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 motion-safe:animate-pulse" />
                {currentStage.label}
              </span>
            )}
          </div>

          <div className="relative px-6 pb-8 pt-10 text-center">
            <div className="mx-auto flex h-16 w-20 items-center justify-center">
              {failed ? (
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-400/15 text-rose-300">
                  <Icon d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" className="h-7 w-7" />
                </span>
              ) : (
                <WorkingBars />
              )}
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
              {failed ? 'Something went wrong' : 'Processing your file'}
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-teal-100/80" role="status" aria-live="polite">
              {failed
                ? error || 'We could not finish processing this file. Please try uploading it again.'
                : currentStage.hint}
            </p>

            {/* Stage tracker */}
            {!failed && (
              <ol className="mx-auto mt-8 flex max-w-sm items-center" aria-label="Processing progress">
                {STAGES.map((s, i) => {
                  const done = i < currentIndex;
                  const active = i === currentIndex;
                  return (
                    <li key={s.key} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center gap-2">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                            done
                              ? 'bg-teal-400 text-teal-950'
                              : active
                              ? 'bg-amber-400 text-teal-950 ring-4 ring-amber-400/20'
                              : 'bg-white/10 text-teal-100/60'
                          }`}
                          aria-current={active ? 'step' : undefined}
                        >
                          {done ? <Icon d="M5 13l4 4L19 7" className="h-4 w-4" /> : i + 1}
                        </span>
                        <span className={`text-[11px] font-medium ${active ? 'text-white' : 'text-teal-100/60'}`}>
                          {s.label}
                        </span>
                      </div>
                      {i < STAGES.length - 1 && (
                        <span className={`mx-2 mb-6 h-px flex-1 ${done ? 'bg-teal-400' : 'bg-white/15'}`} />
                      )}
                    </li>
                  );
                })}
              </ol>
            )}

            {failed && (
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button onClick={() => router.push('/upload')} className={btnPrimary}>
                  Try uploading again
                </button>
                <Link href="/dashboard" className="text-sm font-medium text-teal-100 hover:text-white">
                  Back to dashboard
                </Link>
              </div>
            )}
          </div>
        </div>

        {!failed && (
          <p className="mt-6 text-center text-xs text-stone-500">
            This usually takes a minute or two depending on file length. You can leave this page open, we will take you
            to the editor automatically.
          </p>
        )}
      </div>
    </div>
  );
}