// frontend/src/components/upload/Dropzone.jsx
'use client';
import { useState, useRef } from 'react';
import { ACCEPTED_UPLOAD_FORMATS, MAX_UPLOAD_MB } from '@/lib/constants';

export default function Dropzone({ onFileSelected }) {
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  function validate(file) {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_UPLOAD_FORMATS.includes(ext)) {
      return `"${ext}" isn't supported. Use ${ACCEPTED_UPLOAD_FORMATS.join(', ')}.`;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_UPLOAD_MB) {
      return `This file is ${Math.round(sizeMB)}MB; the maximum is ${MAX_UPLOAD_MB}MB.`;
    }
    return null;
  }

  function handleFile(file) {
    const err = validate(file);
    if (err) { setError(err); return; }
    setError(null);
    onFileSelected(file);
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Choose a file to upload"
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => inputRef.current.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current.click(); }
        }}
        className={`group cursor-pointer rounded-2xl border-2 border-dashed px-6 py-14 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 ${
          dragActive
            ? 'border-teal-500 bg-teal-50 shadow-inner'
            : 'border-stone-300 bg-stone-50/60 hover:border-teal-400 hover:bg-teal-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_UPLOAD_FORMATS.join(',')}
          className="hidden"
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        />
        <span className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-md ring-1 ring-stone-200 transition-transform duration-300 ${dragActive ? 'scale-110' : 'group-hover:-translate-y-1'}`}>
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
          </svg>
        </span>
        <p className="text-lg font-semibold text-stone-900">
          {dragActive ? 'Drop to upload' : 'Drag and drop a file, or click to browse'}
        </p>
        <p className="mt-1.5 text-sm text-stone-500">
          MP4, MP3 or WAV, up to {MAX_UPLOAD_MB}MB
        </p>
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}