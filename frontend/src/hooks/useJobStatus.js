'use client';

import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';

export function useJobStatus(jobId) {
  const [status, setStatus] = useState('queued'); // 'queued' | 'processing' | 'done' | 'failed'
  const [stage, setStage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    if (!jobId) return;

    const token = localStorage.getItem('sentinelcut_token');
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

    // 1. Attempt WebSocket Connection
    try {
      const ws = new WebSocket(`${WS_URL}/jobs/${jobId}?token=${token}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'status_update') {
          setStatus(data.status);
          setStage(data.stage);
          // Mock progress based on stage for smooth UI
          if (data.stage === 'extracting_audio') setProgress(15);
          if (data.stage === 'transcribing') setProgress(40);
          if (data.stage === 'detecting') setProgress(75);
          if (data.stage === 'rendering') setProgress(90);
        } else if (data.type === 'job_completed') {
          setStatus('done');
          setProgress(100);
        } else if (data.type === 'job_failed') {
          setStatus('failed');
          setError(data.error_message);
        }
      };

      ws.onerror = () => {
        console.warn('WebSocket failed, falling back to polling...');
        startPolling();
      };
      
      ws.onclose = () => {
        // If closed prematurely and not done/failed, start polling
        if (status !== 'done' && status !== 'failed') {
           startPolling();
        }
      }

    } catch (err) {
      console.warn('WebSocket setup failed, falling back to polling...', err);
      startPolling();
    }

    // 2. Fallback Polling Logic (Runs if WS fails)
    const startPolling = () => {
      if (pollingIntervalRef.current) return;
      
      pollingIntervalRef.current = setInterval(async () => {
        try {
          // Assuming you have a route to get job status directly. 
          // If not, you might poll the file endpoint directly depending on backend setup.
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/jobs/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          
          if (data.success) {
            setStatus(data.data.status);
            setStage(data.data.stage);
            
            if (data.data.status === 'done' || data.data.status === 'failed') {
              clearInterval(pollingIntervalRef.current);
            }
          }
        } catch (pollErr) {
          console.error("Polling error:", pollErr);
        }
      }, 5000); // 5-second polling per PRD
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [jobId, status]);

  return { status, stage, progress, error };
}