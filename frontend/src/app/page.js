// frontend/src/app/page.js
import Link from 'next/link';
import { Waveform, btnPrimary, btnSecondary, btnOnDark } from '@/components/ui/primitives';

const BARS = [8, 14, 22, 12, 18, 10];
const CENSORED = new Set([2, 3]);

function LogoMark({ className = 'h-10 w-10' }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-xl bg-teal-950 shadow-md shadow-teal-950/30 ${className}`}>
      <svg viewBox="0 0 36 28" className="h-3/5 w-3/5" aria-hidden="true">
        {BARS.map((h, i) => (
          <rect key={i} x={i * 6 + 1} y={14 - h / 2} width="3.5" height={h} rx="1.75"
            className={CENSORED.has(i) ? 'fill-amber-400' : 'fill-teal-300'} />
        ))}
      </svg>
    </span>
  );
}

function Icon({ d, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

// A censored word shown as an amber block.
function Beep({ w = 'w-14' }) {
  return <span className={`mx-0.5 inline-block h-4 ${w} translate-y-0.5 rounded bg-amber-400 align-middle motion-safe:animate-pulse`} aria-label="censored word" />;
}

const STEPS = [
  { title: 'Upload', body: 'Drop in an MP3, WAV or MP4. Processing starts the moment the upload finishes.' },
  { title: 'AI detects profanity', body: 'Speech is transcribed, every word is timestamped, and each one is checked against dictionaries and context.' },
  { title: 'Review on the timeline', body: 'Every flagged word is highlighted. Keep it, remove it, or add your own before anything is changed.' },
  { title: 'Export clean media', body: 'Download your file with flagged words replaced by a beep or by silence. Everything else stays untouched.' },
];

const FEATURES = [
  { title: 'Word-level timestamps', body: 'Faster-Whisper transcription with forced alignment pins each word to its exact position in the audio.', d: 'M12 8v4l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { title: 'Context-aware detection', body: 'Dictionary matching is combined with context scoring, so harmless words are not flagged by accident.', d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { title: 'Timeline editor', body: 'Play back the audio with the transcript, review every detection, and fix mistakes in a few clicks.', d: 'M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2' },
  { title: 'Beep or mute', body: 'Choose a 1000 Hz censor tone or plain silence for the flagged segments.', d: 'M15.5 8.5a5 5 0 010 7M18.4 5.6a9 9 0 010 12.8M5.6 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.6l4.7-4.7c.6-.6 1.7-.2 1.7.7v14c0 .9-1.1 1.3-1.7.7L5.6 15z' },
  { title: 'Your own word list', body: 'Add words that matter to your audience. They are applied on top of the built-in dictionaries for every upload.', d: 'M12 5v14M5 12h14' },
  { title: 'Audio and video', body: 'Video files keep their picture. Only the audio track is edited and re-attached.', d: 'M3 7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM17 10l4-2v8l-4-2' },
];

const LANGS = [
  { name: 'English', note: 'Standard and slang profanity' },
  { name: 'हिन्दी', note: 'Hindi in Devanagari script' },
  { name: 'Hinglish', note: 'Hindi written in Latin letters, and mixed sentences' },
];

const FAQ = [
  { q: 'Which languages are supported?', a: 'English, Hindi and Hinglish (Hindi mixed with English). The detector has a dictionary for each and scores words in context.' },
  { q: 'Which file types can I upload?', a: 'MP3, WAV and MP4 files. Video keeps its picture; only the audio is changed.' },
  { q: 'Can I review the results before exporting?', a: 'Yes. Every detection appears on the timeline and transcript. You can approve, remove or add segments, then export.' },
  { q: 'Does censoring reduce audio quality?', a: 'Only the flagged segments are replaced. The rest of the audio is not altered.' },
  { q: 'Can I censor words that are not in your dictionaries?', a: 'Yes. Add them to your custom word list in Settings and they are applied to future uploads.' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F3F6F5] font-sans text-stone-900 antialiased">
      {/* Navigation */}
      <header className="sticky top-0 z-30 bg-white/80 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
            <LogoMark />
            <span className="text-xl font-bold tracking-tight">Sentinel<span className="text-teal-700">Cut</span></span>
          </Link>
          <nav aria-label="Sections" className="hidden items-center gap-7 text-sm font-medium text-stone-600 md:flex">
            <a href="#how-it-works" className="hover:text-teal-800">How it works</a>
            <a href="#features" className="hover:text-teal-800">Features</a>
            <a href="#languages" className="hover:text-teal-800">Languages</a>
            <Link href="/pricing" className="hover:text-teal-800">Pricing</Link>
            <a href="#faq" className="hover:text-teal-800">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className={`${btnSecondary} hidden sm:inline-flex`}>Log in</Link>
            <Link href="/signup" className={btnPrimary}>Sign up</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-gradient-to-b from-teal-100/70 to-transparent" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-8 lg:grid-cols-2 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-teal-800 shadow-sm ring-1 ring-teal-200">
              <span className="h-2 w-2 rounded-full bg-teal-600" />
              English, Hindi and Hinglish
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Bleep the bad words. <span className="text-teal-700">Keep everything else.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
              Upload audio or video and SentinelCut finds profanity down to the exact word, then beeps or mutes it.
              You review every detection before you export.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className={`${btnPrimary} !px-7 !py-3.5`}>Start free</Link>
              <Link href="/upload" className={`${btnSecondary} !px-7 !py-3.5`}>Upload a file</Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-600">
              {['MP3, WAV and MP4', 'Review before export', 'Beep or mute'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Icon d="M5 13l4 4L19 7" className="h-4 w-4 text-teal-700" />{t}
                </li>
              ))}
            </ul>
          </div>

          {/* Product preview: the memorable element */}
          <div className="relative">
            <div aria-hidden="true" className="absolute -inset-4 rounded-3xl bg-teal-300/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl bg-teal-950 text-white shadow-2xl shadow-teal-950/30">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-xs text-teal-100/80">
                <span className="font-medium">interview_final.mp4</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/15 px-2.5 py-1 text-teal-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />Ready
                </span>
              </div>
              <div className="px-5 pt-6">
                <Waveform tone="dark" className="h-24 w-full" />
                <div className="mt-2 flex justify-between text-[11px] tabular-nums text-teal-100/60">
                  <span>0:00</span><span>0:42</span><span>1:24</span>
                </div>
              </div>
              <div className="space-y-3 p-5 text-sm leading-relaxed text-teal-50/90">
                <p><span className="mr-2 text-xs tabular-nums text-teal-200/60">0:12</span>Honestly, that was the most <Beep /> meeting I have ever sat through.</p>
                <p><span className="mr-2 text-xs tabular-nums text-teal-200/60">0:31</span>यह पूरा प्लान <Beep w="w-12" /> निकला, समझे?</p>
                <p><span className="mr-2 text-xs tabular-nums text-teal-200/60">0:47</span>Bro ye scene <Beep w="w-16" /> hai, let us redo it.</p>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 bg-black/20 px-5 py-3 text-xs text-teal-100/80">
                <span>3 words censored</span>
                <span className="rounded-md bg-amber-400 px-2.5 py-1 font-semibold text-teal-950">Export</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Languages strip */}
      <section id="languages" className="scroll-mt-20 bg-white py-16 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Built for the way people really talk</h2>
            <p className="mt-3 text-stone-600">
              Most filters only handle English spelling. SentinelCut also understands Hindi and the Hindi-English mix that is common in everyday speech.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {LANGS.map((l) => (
              <div key={l.name} className="rounded-2xl border border-stone-200 bg-stone-50/60 p-6">
                <p className="text-2xl font-semibold text-teal-800">{l.name}</p>
                <p className="mt-2 text-sm text-stone-600">{l.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works: a real sequence, so numbered */}
      <section id="how-it-works" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <h2 className="max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">From raw file to clean export in four steps</h2>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm font-semibold text-teal-950">{i + 1}</span>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <h2 className="max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">Precise where it counts, simple everywhere else</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-px hover:border-teal-300 hover:shadow-md">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition group-hover:bg-teal-700 group-hover:text-white">
                  <Icon d={f.d} />
                </span>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 bg-white py-20 shadow-sm">
        <div className="mx-auto max-w-3xl px-4 sm:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Questions, answered</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="group rounded-xl border border-stone-200 bg-stone-50/60 px-5 py-4 open:bg-white open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <Icon d="M6 9l6 6 6-6" className="h-4 w-4 shrink-0 text-teal-700 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 sm:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-teal-950 px-6 py-14 text-center text-white shadow-xl shadow-teal-950/20 sm:px-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
          <Waveform tone="dark" className="relative mx-auto mb-6 h-12 w-48" />
          <h2 className="relative text-2xl font-bold tracking-tight sm:text-4xl">Clean up your first file in minutes</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm text-teal-100/80 sm:text-base">
            Create an account, upload a recording, and review the detections yourself before you export.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className={btnOnDark}>Create free account</Link>
            <Link href="/login" className="text-sm font-medium text-teal-100 hover:text-white">I already have an account</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white shadow-[0_-1px_12px_-6px_rgba(15,61,58,0.2)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-7 w-7 !rounded-lg" />
            <span className="font-semibold text-stone-800">SentinelCut</span>
            <span>© 2026</span>
          </div>
          <nav aria-label="Footer" className="flex gap-6">
            <Link href="/pricing" className="hover:text-teal-800">Pricing</Link>
            <Link href="/login" className="hover:text-teal-800">Log in</Link>
            <Link href="/signup" className="hover:text-teal-800">Sign up</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}