'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function ProfileForm({
  initial
}: {
  initial: { name: string; city: string; interests: string };
}) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState(initial.name);
  const [city, setCity] = useState(initial.city);
  const [interests, setInterests] = useState(initial.interests);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    setError(null);

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setError('Not signed in.');
      setBusy(false);
      return;
    }

    const tokens = interests
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from('profiles')
      .update({
        name,
        city,
        interests: tokens,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-base font-semibold">About you</h2>
      <div>
        <label className="label" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="city">
          City
        </label>
        <input
          id="city"
          className="input"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="interests">
          Interests (comma separated)
        </label>
        <input
          id="interests"
          className="input"
          placeholder="parenting, sleep, music, soccer"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {saved ? <p className="text-sm text-green-600">Saved ✓</p> : null}
      <button type="submit" disabled={busy} className="btn-primary">
        {busy ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}
