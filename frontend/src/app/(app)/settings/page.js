'use client';

// frontend/src/app/(app)/settings/page.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { api } from '@/lib/api-client';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0D10] p-6 sm:p-10 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-[#9AA1AC]">Manage your account and detection preferences.</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Account info */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-900 dark:text-white font-medium">{email}</span>
            </div>
            {displayName && (
              <div className="flex justify-between">
                <span className="text-gray-500">Display name</span>
                <span className="text-gray-900 dark:text-white font-medium">{displayName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Custom words */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Custom Word List
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Words you add here are merged into detection on every future upload, alongside the
            built-in English/Hindi/Hinglish dictionaries.
          </p>

          <form onSubmit={handleAddWord} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Add a word…"
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={adding || !newWord.trim()}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-colors"
            >
              Add
            </button>
          </form>

          {customWords.length === 0 ? (
            <p className="text-sm text-gray-400">No custom words added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {customWords.map((w) => (
                <span
                  key={w.id}
                  className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm px-3 py-1.5 rounded-full"
                >
                  {w.word}
                  <button
                    onClick={() => handleDeleteWord(w.id)}
                    className="text-gray-400 hover:text-rose-500 transition-colors"
                    aria-label={`Remove ${w.word}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}