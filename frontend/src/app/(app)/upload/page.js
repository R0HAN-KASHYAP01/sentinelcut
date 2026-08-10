'use client';

import React, { useState } from 'react';
// Replaced next/navigation with a simple state to handle routing for the preview environment
// import { useRouter } from 'next/navigation';

export default function UploadPage() {
  // const router = useRouter();
  const [detectionMode, setDetectionMode] = useState('automatic');
  const [outputMode, setOutputMode] = useState('beep');
  const [isDragging, setIsDragging] = useState(false);
  
  // NEW STATE: Track the selected file and upload status
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleStartProcessing = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Prepare FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('original_filename', file.name);

      // UNCOMMENT THIS WHEN BACKEND IS READY
      // const uploadRes = await api.post('/files/upload', formData);
      
      // 2. Start Processing Job
      // await api.post(`/files/${uploadRes.file_id}/process`, {
      //   detection_mode: detectionMode,
      //   replacement_mode: outputMode,
      //   custom_words: [],
      // });

      console.log('Successfully captured file:', file.name);
      alert("File upload simulation complete! In a real app, it would now route to the processing status page.");
      
      // router.push(`/files/${uploadRes.file_id}/processing`);
    } catch (error) {
      console.error("Upload failed", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const RadioCard = ({ id, name, value, checked, onChange, title, description, icon }) => (
    <label 
      htmlFor={id}
      className={`relative flex cursor-pointer rounded-xl border p-4 focus:outline-none transition-all duration-200 ease-in-out ${
        checked 
          ? 'border-[#6D5EF6] dark:border-[#8B7CFF] bg-[#6D5EF6]/5 dark:bg-[#8B7CFF]/10 ring-1 ring-[#6D5EF6] dark:ring-[#8B7CFF]' 
          : 'border-gray-200 dark:border-[#262B33] bg-white dark:bg-[#1B1F26] hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <input type="radio" id={id} name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center">
          <div className="text-sm">
            <p className={`font-semibold flex items-center gap-2 ${checked ? 'text-[#6D5EF6] dark:text-[#8B7CFF]' : 'text-gray-900 dark:text-white'}`}>
              {icon}
              {title}
            </p>
            <div className={`mt-1 text-xs ${checked ? 'text-[#6D5EF6]/80 dark:text-[#8B7CFF]/80' : 'text-gray-500 dark:text-gray-400'}`}>
              {description}
            </div>
          </div>
        </div>
        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${checked ? 'border-[#6D5EF6] dark:border-[#8B7CFF] bg-[#6D5EF6] dark:bg-[#8B7CFF]' : 'border-gray-300 dark:border-gray-600'}`}>
          {checked && <div className="h-2 w-2 rounded-full bg-white" />}
        </div>
      </div>
    </label>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0D10] py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
            Process New Media
          </h1>
          <p className="text-lg text-gray-600 dark:text-[#9AA1AC] max-w-2xl mx-auto">
            Upload your audio or video file and configure your censorship preferences. Our AI will automatically detect and isolate profanity.
          </p>
        </div>

        {/* Main Card Surface */}
        <div className="bg-white dark:bg-[#14171C] rounded-2xl shadow-sm border border-gray-200 dark:border-[#262B33] overflow-hidden">
          <div className="p-8 sm:p-10">

            {/* Drag and Drop Zone */}
            <div 
              className={`relative group border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-200 ease-in-out ${
                isDragging 
                  ? 'border-[#6D5EF6] dark:border-[#8B7CFF] bg-[#6D5EF6]/5 dark:bg-[#8B7CFF]/5' 
                  : 'border-gray-300 dark:border-[#262B33] hover:border-[#6D5EF6]/50 dark:hover:border-[#8B7CFF]/50 bg-gray-50/50 dark:bg-[#1B1F26]/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { 
                e.preventDefault(); 
                setIsDragging(false); 
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setFile(e.dataTransfer.files[0]);
                }
              }}
            >
              <div className="mx-auto w-16 h-16 mb-5 bg-white dark:bg-[#14171C] shadow-sm border border-gray-100 dark:border-[#262B33] text-[#6D5EF6] dark:text-[#8B7CFF] rounded-full flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              </div>
              
              {/* Dynamic UI: Show file name if selected, otherwise show instructions */}
              {file ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="text-xl font-bold text-[#6D5EF6] dark:text-[#8B7CFF] mb-2">{file.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-[#9AA1AC]">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
                  </p>
                  <button onClick={() => setFile(null)} className="mt-4 text-xs font-bold text-[#F43F5E] dark:text-[#FB7185] hover:underline uppercase tracking-wider">
                    Remove file
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Click to upload or drag and drop</h3>
                  <p className="text-sm text-gray-500 dark:text-[#9AA1AC] max-w-xs mx-auto">
                    MP4, MOV, MP3, WAV (max. 500MB)
                  </p>
                </>
              )}
              
              {/* Browse Button overlay - Hidden if file is already selected */}
              {!file && (
                <div className="mt-6">
                  <label className="cursor-pointer px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-[#262B33] border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#6D5EF6] dark:focus-within:ring-offset-[#14171C] transition-colors">
                    Browse Files
                    <input type="file" className="hidden" onChange={handleFileSelect} accept="audio/*,video/*" />
                  </label>
                </div>
              )}
            </div>

            {/* Configuration Section */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Detection Mode */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#6D5EF6]/10 dark:bg-[#8B7CFF]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#6D5EF6] dark:text-[#8B7CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detection Mode</h3>
                </div>
                
                <div className="flex flex-col gap-3">
                  <RadioCard 
                    id="detect-auto" name="detectMode" value="automatic" 
                    checked={detectionMode === 'automatic'} onChange={() => setDetectionMode('automatic')}
                    title="Automatic (AI)" description="Uses built-in dictionaries & context scoring."
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                  />
                  <RadioCard 
                    id="detect-custom" name="detectMode" value="custom" 
                    checked={detectionMode === 'custom'} onChange={() => setDetectionMode('custom')}
                    title="Custom Words" description="Only flags words from your specific list."
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                  />
                  <RadioCard 
                    id="detect-combined" name="detectMode" value="combined" 
                    checked={detectionMode === 'combined'} onChange={() => setDetectionMode('combined')}
                    title="Combined" description="Merges AI detection with your custom list."
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                  />
                </div>

                {/* Conditional Textarea for Custom/Combined */}
                {(detectionMode === 'custom' || detectionMode === 'combined') && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-[#9AA1AC] mb-2 uppercase tracking-wider">Custom Word List</label>
                    <textarea 
                      rows="3" 
                      className="w-full bg-gray-50 dark:bg-[#1B1F26] border border-gray-200 dark:border-[#262B33] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#6D5EF6] dark:focus:ring-[#8B7CFF] focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-shadow" 
                      placeholder="Enter words separated by commas (e.g. word1, word2)"
                    ></textarea>
                  </div>
                )}
              </div>

              {/* Output Mode */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#6D5EF6]/10 dark:bg-[#8B7CFF]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#6D5EF6] dark:text-[#8B7CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18l-6-6H4a1 1 0 01-1-1V9a1 1 0 011-1h2l6-6v16z"></path></svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Output Mode</h3>
                </div>

                <div className="flex flex-col gap-3">
                  <RadioCard 
                    id="out-beep" name="outputMode" value="beep" 
                    checked={outputMode === 'beep'} onChange={() => setOutputMode('beep')}
                    title="Beep (1000Hz Tone)" description="Replaces profanity with a standard censor beep."
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>}
                  />
                  <RadioCard 
                    id="out-mute" name="outputMode" value="mute" 
                    checked={outputMode === 'mute'} onChange={() => setOutputMode('mute')}
                    title="Mute (Silence)" description="Removes the audio track entirely during the word."
                    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="bg-gray-50 dark:bg-[#1B1F26] px-8 py-6 border-t border-gray-200 dark:border-[#262B33] flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-[#9AA1AC]">
              Processing typically takes ≤2x the media duration.
            </p>
            <button 
              onClick={handleStartProcessing}
              disabled={isUploading || !file}
              className={`font-semibold py-3 px-8 rounded-xl shadow-md transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isUploading || !file 
                  ? 'bg-gray-300 dark:bg-[#262B33] text-gray-500 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#6D5EF6] to-[#8B7CFF] hover:from-[#5A4AD2] hover:to-[#7A6AE6] text-white hover:shadow-lg hover:-translate-y-0.5 focus:ring-[#6D5EF6] dark:focus:ring-offset-[#14171C]'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Start Processing'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}