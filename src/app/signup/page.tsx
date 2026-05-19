'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const supabase = createClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${siteUrl}/auth/callback`
      }
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md py-10">
        <div className="card text-center">
          <div className="mb-2 text-3xl">📬</div>
          <h1 className="text-xl font-semibold">Check your inbox</h1>
          <p className="mt-2 text-sm text-slate-500">
            We&apos;ve sent a verification email to <strong>{email}</strong>. Click the link to
            confirm your account, then sign in.
          </p>
          <Link href="/login" className="btn-primary mt-5 inline-flex">
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Join ParentCircle</h1>
      <p className="mt-1 text-sm text-slate-500">
        A community of parents helping parents grow together.
      </p>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="name">
            Your name
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            autoComplete="new-password"
          />
          <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already a member?{' '}
        <Link className="font-medium text-brand-600" href="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
