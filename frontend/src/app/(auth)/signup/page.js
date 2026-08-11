'use client';


// frontend/src/app/(auth)/signup/page.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';

function checkPasswordStrength(password) {
  const hasMinLength = password.length >= 8;
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return { hasMinLength, hasDigit, hasSpecial, isValid: hasMinLength && hasDigit && hasSpecial };
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = checkPasswordStrength(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!strength.isValid) {
      setError('Password must be at least 8 characters with a digit and a special character.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName || undefined },
        },
      });

      if (signUpError) throw signUpError;

      router.push('/login?signup=success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary mb-1">Create your account</h1>
      <p className="text-sm text-text-secondary mb-6">Start censoring in English, Hindi & Hinglish.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1">Display name (optional)</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-primary"
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-primary"
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-primary"
          />
          {password.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs">
              <li className={strength.hasMinLength ? 'text-accent-teal' : 'text-text-secondary'}>
                {strength.hasMinLength ? '✓' : '○'} At least 8 characters
              </li>
              <li className={strength.hasDigit ? 'text-accent-teal' : 'text-text-secondary'}>
                {strength.hasDigit ? '✓' : '○'} At least 1 digit
              </li>
              <li className={strength.hasSpecial ? 'text-accent-teal' : 'text-text-secondary'}>
                {strength.hasSpecial ? '✓' : '○'} At least 1 special character
              </li>
            </ul>
          )}
        </div>

        {error && <p className="text-sm text-accent-rose">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-primary text-white py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <p className="text-sm text-text-secondary mt-6 text-center">
        Already have an account? <a href="/login" className="text-brand-primary">Log in</a>
      </p>
    </div>
  );
}