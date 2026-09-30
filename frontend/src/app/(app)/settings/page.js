// frontend/src/app/(app)/settings/page.js
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { api } from '@/lib/api-client';
import {
  PageShell, PageHeader, ErrorBanner, btnPrimary, inputCls,
} from '@/components/ui/primitives';

function Section({ title, description, children }) {
  return (
    <section className="mb-6 grid gap-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:grid-cols-3 md:gap-10 md:p-8">
      <div>
        <h2 className="text-base font-semibold text-stone-900">{title}</h2>
        {description && <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{description}</p>}
      </div>
      <div className="md:col-span-2">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [customWords, setCustomWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setEmail(data.user.email || '');
          setDisplayName(data.user.user_metadata?.display_name || '');
        }
        const words = await api.get('/custom-words');
        setCustomWords(words);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAddWord = async (e) => {
    e.preventDefault();
    const word = newWord.trim();
    if (!word) return;
    setAdding(true);
    setError('');
    try {
      const created = await api.post('/custom-words', { word });
      setCustomWords((prev) => [...prev, created]);
      setNewWord('');
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteWord = async (id) => {
    try {
      await api.delete(`/custom-words/${id}`);
      setCustomWords((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <PageShell width="max-w-3xl">
        <div className="space-y-4" aria-busy="true">
          <div className="h-8 w-40 animate-pulse rounded bg-stone-200" />
          <div className="h-40 animate-pulse rounded-2xl bg-white" />
          <div className="h-56 animate-pulse rounded-2xl bg-white" />
        </div>
      </PageShell>
    );
  }

  const initial = (displayName || email || '?').charAt(0).toUpperCase();

  return (
    <PageShell width="max-w-3xl">
      <PageHeader title="Settings" subtitle="Your account and detection preferences." />
      <ErrorBanner>{error}</ErrorBanner>

      <Section title="Account" description="Sign-in details for this workspace.">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-700 text-lg font-semibold text-white shadow-md shadow-teal-900/20">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stone-900">{displayName || 'Your account'}</p>
            <p className="truncate text-xs text-stone-500">{email}</p>
          </div>
        </div>
        <dl className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-stone-50/50 text-sm">
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-stone-500">Email</dt>
            <dd className="truncate font-medium text-stone-900">{email}</dd>
          </div>
          {displayName && (
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-stone-500">Display name</dt>
              <dd className="truncate font-medium text-stone-900">{displayName}</dd>
            </div>
          )}
        </dl>
      </Section>

      <Section
        title="Custom word list"
        description="Added to the built-in English, Hindi and Hinglish dictionaries on every upload."
      >
        <form onSubmit={handleAddWord} className="mb-5 flex gap-2">
          <input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="Add a word to censor"
            aria-label="New custom word"
            className={inputCls}
          />
          <button type="submit" disabled={adding || !newWord.trim()} className={`${btnPrimary} shrink-0`}>
            {adding ? 'Adding…' : 'Add word'}
          </button>
        </form>

        {customWords.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/40 px-4 py-8 text-center text-sm text-stone-600">
            No custom words yet. Words you add are censored in future uploads.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {customWords.map((w) => (
              <li
                key={w.id}
                className="inline-flex items-center gap-1 rounded-full bg-amber-50 py-1 pl-3.5 pr-1.5 text-sm font-medium text-amber-900 ring-1 ring-inset ring-amber-300"
              >
                {w.word}
                <button
                  onClick={() => handleDeleteWord(w.id)}
                  aria-label={`Remove ${w.word}`}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-amber-700 transition-colors hover:bg-red-100 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
                >
                  <svg viewBox="0 0 12 12" className="h-3 w-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l6 6M9 3l-6 6" /></svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </PageShell>
  );
}