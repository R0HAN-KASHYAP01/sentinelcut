// frontend/src/app/(app)/upload/page.js
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import Dropzone from '@/app/(app)/upload/Dropzone';
import {
  PageShell, PageHeader, ErrorBanner, FileIcon, btnPrimary, btnSecondary, inputCls,
} from '@/components/ui/primitives';

const ICONS = {
  bolt: 'M13 10V3L4 14h7v7l9-11h-7z',
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  merge: 'M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  speaker: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z',
  mute: 'M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l4-4m0 4l-4-4',
};

function Icon({ name, className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[name]} />
    </svg>
  );
}

// Defined outside the page component so it is not remounted on every render.
function RadioCard({ id, name, value, checked, onChange, title, description, icon }) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition focus-within:ring-2 focus-within:ring-teal-600 focus-within:ring-offset-2 ${
        checked
          ? 'border-teal-600 bg-teal-50 shadow-sm ring-1 ring-teal-600'
          : 'border-stone-200 bg-white hover:border-teal-300 hover:bg-stone-50'
      }`}
    >
      <input type="radio" id={id} name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${checked ? 'bg-teal-700 text-white' : 'bg-stone-100 text-stone-500'}`}>
        <Icon name={icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-semibold ${checked ? 'text-teal-900' : 'text-stone-900'}`}>{title}</span>
        <span className="mt-0.5 block text-xs text-stone-500">{description}</span>
      </span>
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${checked ? 'border-teal-700 bg-teal-700' : 'border-stone-300'}`}>
        {checked && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
    </label>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const [detectionMode, setDetectionMode] = useState('automatic');
  const [outputMode, setOutputMode] = useState('beep');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleStartProcessing = async () => {
    if (!file) { setUploadError('Choose a file first.'); return; }

    setIsUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Uploading immediately creates the File row AND queues the Celery
      // processing job on the backend — there is no separate "start
      // processing" call. detectionMode/outputMode aren't sent because the
      // backend doesn't support per-upload config yet (beep-only for MVP).
      const uploadedFile = await api.post('/files/upload', formData);
      router.push(`/files/${uploadedFile.id}/processing`);
    } catch (error) {
      console.error('Upload failed', error);
      setUploadError(error.message || 'Upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <PageShell width="max-w-4xl">
      <PageHeader
        title="Process new media"
        subtitle="Upload an audio or video file. The AI finds profanity and beeps it for you to review."
      />

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="p-6 sm:p-10">
          <ErrorBanner>{uploadError}</ErrorBanner>

          {file ? (
            <div className="flex items-center gap-4 rounded-2xl border border-teal-200 bg-teal-50/60 p-5">
              <FileIcon name={file.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-stone-900">{file.name}</p>
                <p className="mt-0.5 text-xs text-stone-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB, ready to process
                </p>
              </div>
              <button type="button" onClick={() => setFile(null)} disabled={isUploading} className={btnSecondary}>
                Remove
              </button>
            </div>
          ) : (
            <Dropzone onFileSelected={(f) => { setFile(f); setUploadError(''); }} />
          )}

          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700"><Icon name="search" /></span>
                <h2 className="text-base font-semibold text-stone-900">Detection mode</h2>
              </div>
              <div className="flex flex-col gap-3">
                <RadioCard id="detect-auto" name="detectMode" value="automatic" icon="bolt"
                  checked={detectionMode === 'automatic'} onChange={() => setDetectionMode('automatic')}
                  title="Automatic (AI)" description="Uses built-in dictionaries and context scoring." />
                <RadioCard id="detect-custom" name="detectMode" value="custom" icon="edit"
                  checked={detectionMode === 'custom'} onChange={() => setDetectionMode('custom')}
                  title="Custom words" description="Only flags words from your own list." />
                <RadioCard id="detect-combined" name="detectMode" value="combined" icon="merge"
                  checked={detectionMode === 'combined'} onChange={() => setDetectionMode('combined')}
                  title="Combined" description="Merges AI detection with your custom list." />
              </div>

              {(detectionMode === 'custom' || detectionMode === 'combined') && (
                <div className="mt-4">
                  <label htmlFor="custom-words" className="mb-1.5 block text-sm font-medium text-stone-700">Custom word list</label>
                  <textarea
                    id="custom-words"
                    rows={3}
                    className={inputCls}
                    placeholder="Enter words separated by commas, e.g. word1, word2"
                  />
                </div>
              )}
            </div>

            <div>
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><Icon name="speaker" /></span>
                <h2 className="text-base font-semibold text-stone-900">Output mode</h2>
              </div>
              <div className="flex flex-col gap-3">
                <RadioCard id="out-beep" name="outputMode" value="beep" icon="speaker"
                  checked={outputMode === 'beep'} onChange={() => setOutputMode('beep')}
                  title="Beep (1000 Hz tone)" description="Replaces profanity with a standard censor beep." />
                <RadioCard id="out-mute" name="outputMode" value="mute" icon="mute"
                  checked={outputMode === 'mute'} onChange={() => setOutputMode('mute')}
                  title="Mute (silence)" description="Silences the audio for the length of the word." />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-stone-200 bg-stone-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p className="text-sm text-stone-500">Processing usually takes up to twice the media length.</p>
          <button
            type="button"
            onClick={handleStartProcessing}
            disabled={isUploading || !file}
            className={`${btnPrimary} !px-8 !py-3`}
          >
            {isUploading ? 'Uploading…' : 'Start processing'}
          </button>
        </div>
      </div>
    </PageShell>
  );
}