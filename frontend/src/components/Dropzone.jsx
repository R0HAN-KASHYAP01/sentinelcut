'use client';

import { useState, useRef } from 'react';
import { Upload, FileAudio, FileVideo, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Dropzone({ onFileSelected, isUploading, uploadProgress }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const ALLOWED_TYPES = ['video/mp4', 'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav'];
  const MAX_SIZE_MB = 150;

  const validateAndSetFile = (file) => {
    setError(null);
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(mp4|mp3|wav)$/i)) {
      setError('Invalid file type. Please upload an .mp4, .mp3, or .wav file.');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds limit of ${MAX_SIZE_MB}MB.`);
      return;
    }

    setSelectedFile(file);
    if (onFileSelected) onFileSelected(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
    if (onFileSelected) onFileSelected(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Drop area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
            : selectedFile
            ? 'border-emerald-400 bg-emerald-50/30'
            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".mp4,.mp3,.wav"
          onChange={handleChange}
          className="hidden"
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">
                Click to upload <span className="text-slate-500 font-normal">or drag and drop</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">MP4, MP3, or WAV (Max 150MB)</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center">
                {selectedFile.type.includes('video') ? <FileVideo className="w-5 h-5" /> : <FileAudio className="w-5 h-5" />}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800 truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center space-x-2 text-rose-600 bg-rose-50 p-3 rounded-lg text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-700">Uploading media file...</span>
            <span className="text-indigo-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}