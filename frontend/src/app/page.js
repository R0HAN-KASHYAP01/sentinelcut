import Link from 'next/link';

export default function Home() {
return (
    <main>
      {/* Navigation Bar */}
  <header className="w-full max-w-6xl mx-auto py-6 flex items-center justify-between border-b border-[var(--border-subtle)]">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)] text-white font-bold flex items-center justify-center text-lg shadow">
        ✂️
      </div>
      <div>
        <span className="font-extrabold text-xl tracking-tight text-[var(--text-primary)]">SentinelCut</span>
        <span className="block text-[10px] font-mono text-[var(--text-secondary)] uppercase">Multilingual AI</span>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="px-4 py-2 text-sm font-medium rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-raised)] transition-colors text-[var(--text-primary)]"
      >
        Log In
      </Link>
      <Link
        href="/signup"
        className="px-5 py-2 text-sm font-semibold rounded-xl bg-[var(--brand-primary)] text-white hover:opacity-90 active:scale-95 transition-all shadow-md"
      >
        Sign Up →
      </Link>
    </div>
  </header>

  {/* Hero Container */}
  <div className="max-w-4xl w-full mx-auto text-center space-y-8 my-auto py-16">
    
    {/* Badge */}
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] shadow-sm">
      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
      <span>Faster-Whisper ASR & Multilingual Engine v2.4</span>
    </div>

    {/* Heading */}
    <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
      Microsecond-Precise{' '}
      <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Multilingual Profanity
      </span>{' '}
      Censorship
    </h1>

    <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
      Automatically transcribe, align word timestamps, and censor explicit content across{' '}
      <strong className="text-[var(--text-primary)]">English, Hindi, and Hinglish</strong> with zero audio degradation.
    </p>

    {/* Call-To-Actions */}
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
      <Link
        href="/signup"
        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[var(--brand-primary)] text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md"
      >
        Get Started Free
      </Link>
      <Link
        href="/upload"
        className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] font-semibold text-sm hover:bg-[var(--bg-surface-raised)] transition-colors text-[var(--text-primary)]"
      >
        Upload Media File →
      </Link>
    </div>

    {/* Features Checklist */}
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-lg p-6 text-left max-w-2xl mx-auto space-y-3 mt-8">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">Platform Core Features</h2>
      <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
        <li className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
          Microsecond timestamp alignment via Faster-Whisper ASR
        </li>
        <li className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
          Multilingual profanity engine (English, Hindi & Hinglish context scoring)
        </li>
        <li className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
          Interactive waveform timeline editor with customizable mute/beep audio export
        </li>
      </ul>
    </div>

  </div>

  {/* Footer */}
  <footer className="w-full text-center py-6 text-xs text-[var(--text-secondary)] border-t border-[var(--border-subtle)]">
    SentinelCut Platform — Person 3 Frontend Lead Workspace
  </footer>
    </main>
  );
}