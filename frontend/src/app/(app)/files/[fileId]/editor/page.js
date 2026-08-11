'use client';

// frontend/src/app/(app)/files/[fileId]/editor/page.js
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';

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
  const [justRegenerated, setJustRegenerated] = useState(false);

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

  const handleToggleStatus = async (detection) => {
    const newStatus = detection.status === 'active' ? 'removed' : 'active';
    try {
      const updated = await api.patch(`/detections/${detection.id}`, { status: newStatus });
      setDetections((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      if (selectedDetection?.id === updated.id) setSelectedDetection(updated);
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
      window.open(url, '_blank'); // signed URL — no auth header needed, safe to open directly
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500">Loading transcript…</p>
      </div>
    );
  }

  const activeCount = detections.filter((d) => d.status === 'active').length;
  const isReady = file?.status === 'done' && file?.censored_storage_path;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 p-6 font-sans overflow-y-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline Editor</h1>
        <p className="text-sm text-gray-500">
          {file?.original_filename} — Review and refine AI detections before exporting.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-1 gap-6 overflow-hidden">

        {/* Left: detection list */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {detections.length === 0 && (
            <p className="text-gray-500 text-sm p-6">No detections found in this file.</p>
          )}
          {detections.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDetection(d)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedDetection?.id === d.id
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300'
              } ${d.status === 'removed' ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 dark:text-white">
                  "{d.word}"
                  {d.status === 'removed' && (
                    <span className="ml-2 text-xs font-normal text-gray-400">(removed)</span>
                  )}
                </span>
                <span className="text-xs text-gray-500">
                  {d.start.toFixed(2)}s – {d.end.toFixed(2)}s
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                <span className="capitalize">{d.language}</span>
                <span>•</span>
                <span className="capitalize">{d.severity}</span>
                <span>•</span>
                <span>{(d.confidence * 100).toFixed(0)}% confidence</span>
              </div>
            </button>
          ))}
        </div>

        {/* Right: detail panel + export panel */}
        <div className="w-80 flex flex-col gap-4">
          {selectedDetection ? (
            <div className="bg-white dark:bg-gray-900 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Detection Details
              </h3>

              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  "{selectedDetection.word}"
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                    {selectedDetection.start.toFixed(2)}s - {selectedDetection.end.toFixed(2)}s
                  </span>
                  <span className="text-gray-500 capitalize">{selectedDetection.language}</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Confidence Score</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      selectedDetection.confidence >= 0.85 ? 'bg-rose-500' : 'bg-amber-500'
                    }`}
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(selectedDetection.confidence * 100).toFixed(0)}%
                  </span>
                  <span className="text-xs text-gray-500 capitalize">({selectedDetection.source})</span>
                </div>
              </div>

              <button
                onClick={() => handleToggleStatus(selectedDetection)}
                className="w-full bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                {selectedDetection.status === 'active' ? 'Remove (unflag)' : 'Restore (re-flag)'}
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-900/50 flex items-center justify-center h-48 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 text-sm">Select a detection to view details.</p>
            </div>
          )}

          {/* Export panel */}
          <div className="bg-white dark:bg-gray-900 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Export
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              {isReady
                ? 'Censored output ready for download.'
                : 'Censoring in progress — export will be available once done.'}
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleDownloadVideo}
                disabled={!isReady || downloading === 'video'}
                className="text-sm font-medium py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
              >
                {downloading === 'video' ? 'Opening…' : 'Download censored audio/video'}
              </button>
              <button
                onClick={handleDownloadTranscript}
                disabled={downloading === 'transcript'}
                className="text-sm font-medium py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-40"
              >
                {downloading === 'transcript' ? 'Downloading…' : 'Download transcript (.txt)'}
              </button>
              <button
                onClick={handleDownloadDetections}
                disabled={downloading === 'detections'}
                className="text-sm font-medium py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-40"
              >
                {downloading === 'detections' ? 'Downloading…' : 'Download detections (.json)'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="mt-6 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <p className="text-sm text-gray-500">{activeCount} active detections</p>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          {regenerating ? 'Regenerating…' : 'Regenerate Output'}
        </button>
      </div>
    </div>
  );
}