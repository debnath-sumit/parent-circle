'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AgeGroup, Child } from '@/types/database';

const AGE_GROUPS: { value: AgeGroup; label: string }[] = [
  { value: 'baby', label: 'Baby (0–24 months)' },
  { value: 'kid', label: 'Kid (2–8 years)' },
  { value: 'teen', label: 'Older / Teen' }
];

export function ChildrenSection({ initial }: { initial: Child[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [children, setChildren] = useState<Child[]>(initial);
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('baby');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addChild(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setError('Not signed in.');
      setBusy(false);
      return;
    }
    const { data, error } = await supabase
      .from('children')
      .insert({ parent_id: user.id, name, age_group: ageGroup })
      .select()
      .single();
    setBusy(false);
    if (error || !data) {
      setError(error?.message ?? 'Failed to add child.');
      return;
    }
    setChildren((prev) => [...prev, data]);
    setName('');
    router.refresh();
  }

  async function removeChild(id: string) {
    const { error } = await supabase.from('children').delete().eq('id', id);
    if (!error) {
      setChildren((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="card space-y-4">
      <h2 className="text-base font-semibold">Your children</h2>
      {children.length === 0 ? (
        <p className="text-sm text-slate-500">No children yet — add your first below.</p>
      ) : (
        <ul className="space-y-2">
          {children.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-slate-500">
                  {AGE_GROUPS.find((a) => a.value === c.age_group)?.label ?? c.age_group}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeChild(c.id)}
                className="text-xs font-medium text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={addChild} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          required
          className="input"
          placeholder="Child name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="input"
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
        >
          {AGE_GROUPS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? 'Adding…' : 'Add child'}
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
