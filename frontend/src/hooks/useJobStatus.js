'use client';
// frontend/src/hooks/useJobStatus.js
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api-client';

// Polls GET /api/v1/files/{fileId} until status is 'done' or 'failed'.
// No WebSocket — backend doesn't expose one yet (websocket_routes.py is
// still a stub). Pure polling is simple, reliable, and matches what the
// backend actually supports today.
export function useJobStatus(fileId, { intervalMs = 3000 } = {}) {
  const [status, setStatus] = useState('uploaded'); // 'uploaded' | 'processing' | 'done' | 'failed'
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);

  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    if (!fileId) return;

    const poll = async () => {
      try {
        const data = await api.get(`/files/${fileId}`);
        setFile(data);
        setStatus(data.status);

        if (data.status === 'done' || data.status === 'failed') {
          clearInterval(pollingIntervalRef.current);
        }
      } catch (err) {
        setError(err.message);
        clearInterval(pollingIntervalRef.current);
      }
    };

    poll(); // fire immediately, don't wait for the first interval tick
    pollingIntervalRef.current = setInterval(poll, intervalMs);

    return () => clearInterval(pollingIntervalRef.current);
  }, [fileId, intervalMs]);

  return { status, file, error };
}