// components/upload/Dropzone.jsx
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
    <div
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
      }}
      onClick={() => inputRef.current.click()}
      className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer
        ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_UPLOAD_FORMATS.join(',')}
        className="hidden"
        onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
      />
      <p>Drag & drop a file, or click to browse</p>
      <p className="text-sm text-gray-500 mt-2">
        MP4 · MP3 · WAV — up to {MAX_UPLOAD_MB}MB
      </p>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}