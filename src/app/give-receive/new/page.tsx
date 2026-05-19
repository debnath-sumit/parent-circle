'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { ItemAgeGroup, ItemCondition, PostType } from '@/types/database';

const CATEGORIES = ['Stroller', 'Toys', 'Clothes', 'Books', 'Feeding', 'Crib', 'Other'];
const POST_TYPES: { value: PostType; label: string }[] = [
  { value: 'giveaway', label: 'Give away' },
  { value: 'borrow', label: 'Lend / Borrow' },
  { value: 'exchange', label: 'Exchange' },
  { value: 'sell', label: 'Sell' }
];
const AGE_GROUPS: { value: ItemAgeGroup; label: string }[] = [
  { value: 'any', label: 'Any age' },
  { value: 'baby', label: 'Baby (0–24m)' },
  { value: 'kid', label: 'Kid (2–8y)' },
  { value: 'teen', label: 'Older / Teen' }
];
const CONDITIONS: { value: ItemCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like new' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' }
];

export default function NewItemPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [postType, setPostType] = useState<PostType>('giveaway');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [ageGroup, setAgeGroup] = useState<ItemAgeGroup>('any');
  const [condition, setCondition] = useState<ItemCondition>('good');
  const [location, setLocation] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setError('You need to sign in first.');
      setBusy(false);
      return;
    }

    let imageUrl: string | null = null;
    if (file) {
      const path = `items/${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { error: upErr } = await supabase.storage.from('images').upload(path, file);
      if (upErr) {
        setError(upErr.message);
        setBusy(false);
        return;
      }
      const { data: pub } = supabase.storage.from('images').getPublicUrl(path);
      imageUrl = pub.publicUrl;
    }

    const { data, error } = await supabase
      .from('items')
      .insert({
        owner_id: user.id,
        post_type: postType,
        category,
        title,
        description,
        age_group: ageGroup,
        condition,
        location,
        image_url: imageUrl,
        status: 'available'
      })
      .select()
      .single();
    setBusy(false);
    if (error || !data) {
      setError(error?.message ?? 'Failed to post.');
      return;
    }
    router.push(`/give-receive/${data.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl py-4">
      <h1 className="text-2xl font-semibold tracking-tight">Share an item</h1>
      <p className="text-sm text-slate-500">
        Give a stroller, lend a swing, or sell a barely-used crib.
      </p>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            required
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Post type</label>
            <select
              className="input"
              value={postType}
              onChange={(e) => setPostType(e.target.value as PostType)}
            >
              {POST_TYPES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Age group</label>
            <select
              className="input"
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value as ItemAgeGroup)}
            >
              {AGE_GROUPS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Condition</label>
            <select
              className="input"
              value={condition}
              onChange={(e) => setCondition(e.target.value as ItemCondition)}
            >
              {CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="location">
            Location / Neighborhood
          </label>
          <input
            id="location"
            className="input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="image">
            Photo
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Posting…' : 'Post item'}
        </button>
      </form>
    </div>
  );
}
