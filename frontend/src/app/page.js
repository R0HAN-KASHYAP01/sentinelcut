export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Gradient heading — tests custom colors + gradient utilities */}
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Welcome to SentinelCut
        </h1>

        <p className="text-lg text-[var(--text-secondary)]">
          If this text is styled, spaced, and colored correctly — Tailwind is working. 🎉
        </p>

        {/* Card — tests border, shadow, rounded, padding, bg-surface var */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-lg p-6 text-left">
          <h2 className="text-xl font-semibold mb-2">CSS Checklist</h2>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Tailwind utility classes rendering
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              CSS variables from globals.css applied
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Responsive breakpoints working
            </li>
          </ul>
        </div>

        {/* Buttons — tests hover, transitions, brand color var */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-6 py-3 rounded-lg bg-[var(--brand-primary)] text-white font-medium hover:opacity-90 active:scale-95 transition-all">
            Primary Button
          </button>
          <button className="px-6 py-3 rounded-lg border border-[var(--border-subtle)] font-medium hover:bg-[var(--bg-surface-raised)] transition-colors">
            Secondary Button
          </button>
        </div>

        {/* Color swatches — tests accent colors from your theme */}
        <div className="flex justify-center gap-3 pt-4">
          <div className="w-10 h-10 rounded-full bg-[var(--accent-teal)]" title="teal" />
          <div className="w-10 h-10 rounded-full bg-[var(--accent-amber)]" title="amber" />
          <div className="w-10 h-10 rounded-full bg-[var(--accent-rose)]" title="rose" />
          <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)]" title="brand" />
        </div>
      </div>
    </main>
  );
}