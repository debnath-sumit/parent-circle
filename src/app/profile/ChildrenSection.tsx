'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AgeGroup, Child } from '@/types/database';

const AGE_LABEL: Record<AgeGroup, string> = {
  baby: 'Baby (0–24 months)',
  kid: 'Kid (2–8 years)',
  teen: 'Older / Teen'
};

function deriveAgeGroup(dob: string): AgeGroup {
  const birth = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years -= 1;
  if (years < 2) return 'baby';
  if (years <= 8) return 'kid';
  return 'teen';
}

function formatDob(dob: string | null): string {
  if (!dob) return '';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return dob;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function ChildrenSection({ initial }: { initial: Child[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [children, setChildren] = useState<Child[]>(initial);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [school, setSchool] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  async function addChild(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    if (!dob) {
      setError('Date of birth is required.');
      setBusy(false);
      return;
    }
    if (dob > today) {
      setError('Date of birth cannot be in the future.');
      setBusy(false);
      return;
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setError('Not signed in.');
      setBusy(false);
      return;
    }

    let photoUrl: string | null = null;
    if (photoFile) {
      const safe = photoFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const path = `children/${user.id}/${Date.now()}-${safe}`;
      const { error: upErr } = await supabase.storage.from('images').upload(path, photoFile);
      if (upErr) {
        setError(upErr.message);
        setBusy(false);
        return;
      }
      photoUrl = supabase.storage.from('images').getPublicUrl(path).data.publicUrl;
    }

    const ageGroup = deriveAgeGroup(dob);
    const { data, error } = await supabase
      .from('children')
      .insert({
        parent_id: user.id,
        name,
        age_group: ageGroup,
        date_of_birth: dob,
        school: school.trim() || null,
        photo: photoUrl
      })
      .select()
      .single();
    setBusy(false);
    if (error || !data) {
      setError(error?.message ?? 'Failed to add child.');
      return;
    }
    setChildren((prev) => [...prev, data]);
    setName('');
    setDob('');
    setSchool('');
    setPhotoFile(null);
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
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                  {c.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.photo} alt={c.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-base text-slate-400">
                      🧒
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    {c.date_of_birth ? formatDob(c.date_of_birth) : AGE_LABEL[c.age_group]}
                    {c.school ? ` · ${c.school}` : ''}
                  </p>
                </div>
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

      <form onSubmit={addChild} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="child-name">
              Child name <span className="text-red-500">*</span>
            </label>
            <input
              id="child-name"
              required
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="child-dob">
              Date of birth <span className="text-red-500">*</span>
            </label>
            <input
              id="child-dob"
              type="date"
              required
              max={today}
              className="input"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="child-school">
              School <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="child-school"
              className="input"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="child-photo">
              Photo <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="child-photo"
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>
        </div>
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? 'Adding…' : 'Add child'}
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
