'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useJobStatus } from '@/hooks/useJobStatus';

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

  const stageLabel = {
    uploaded: 'Queued for processing…',
    processing: 'Analyzing audio & detecting profanity…',
    failed: 'Processing failed',
  }[status] || 'Working…';

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0D10] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status !== 'failed' && !error && (
          <div className="mx-auto w-16 h-16 mb-6 rounded-full border-4 border-[#6D5EF6]/20 dark:border-[#8B7CFF]/20 border-t-[#6D5EF6] dark:border-t-[#8B7CFF] animate-spin" />
        )}

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {status === 'failed' ? 'Something went wrong' : 'Processing your file'}
        </h1>

        <p className="text-sm text-gray-500 dark:text-[#9AA1AC] mb-6">
          {file?.original_filename && (
            <span className="font-medium text-gray-700 dark:text-gray-300">{file.original_filename}</span>
          )}
        </p>

        <p className="text-sm text-gray-600 dark:text-[#9AA1AC]">
          {error ? error : stageLabel}
        </p>

        {status === 'failed' && (
          <button
            onClick={() => router.push('/upload')}
            className="mt-6 px-5 py-2.5 text-sm font-medium text-white bg-[#6D5EF6] rounded-lg hover:bg-[#5A4AD2] transition-colors"
          >
            Try uploading again
          </button>
        )}

        <p className="mt-8 text-xs text-gray-400 dark:text-gray-600">
          This usually takes a minute or two depending on file length.
        </p>
      </div>
    </div>
  );
}