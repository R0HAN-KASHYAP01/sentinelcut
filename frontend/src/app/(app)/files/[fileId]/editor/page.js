'use client';
import { useState, useRef } from 'react';
export function EditorPage() {
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [detections, setDetections] = useState(mockDetections);

  // Mock handler for changing replacement mode
  const handleModeChange = (id, newMode) => {
    setDetections(detections.map(d => d.id === id ? { ...d, replacement: newMode } : d));
    setSelectedDetection(prev => ({ ...prev, replacement: newMode }));
  };

  // Mock handler for dismissing a detection
  const handleDismiss = (id) => {
    setDetections(detections.map(d => d.id === id ? { ...d, status: 'removed' } : d));
    setSelectedDetection(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 p-6 font-sans">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline Editor</h1>
        <p className="text-sm text-gray-500">Review and refine AI detections before exporting.</p>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        
        {/* Left Pane: Transcript */}
        <div className="flex-1 overflow-y-auto">
          <TranscriptView 
            transcript={mockTranscript} 
            detections={detections}
            onSelectDetection={setSelectedDetection}
            selectedDetectionId={selectedDetection?.id}
          />
        </div>

        {/* Right Pane: Detection Detail Panel */}
        <div className="w-80 flex flex-col gap-4">
          {selectedDetection ? (
            <div className="bg-white dark:bg-gray-900 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Detection Details</h3>
              
              <div className="mb-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">"{selectedDetection.word}"</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                    {selectedDetection.start}s - {selectedDetection.end}s
                  </span>
                  <span className="text-gray-500 capitalize">{selectedDetection.language}</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Confidence Score</p>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${selectedDetection.confidence >= 0.85 ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                  <span className="font-medium text-gray-900 dark:text-white">{(selectedDetection.confidence * 100).toFixed(0)}%</span>
                  <span className="text-xs text-gray-500 capitalize">({selectedDetection.source})</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Replacement Mode</label>
                <select 
                  className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                  value={selectedDetection.replacement}
                  onChange={(e) => handleModeChange(selectedDetection.id, e.target.value)}
                >
                  <option value="beep">Beep</option>
                  <option value="mute">Mute</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleDismiss(selectedDetection.id)}
                  className="flex-1 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-900/50 flex items-center justify-center h-48 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 text-sm">Select a highlighted word to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="mt-6 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {detections.filter(d => d.status !== 'removed').length} active detections
        </p>
        <button 
          onClick={() => console.log("Trigger Regeneration with:", detections)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Regenerate Output
        </button>
      </div>
    </div>
  );
}
