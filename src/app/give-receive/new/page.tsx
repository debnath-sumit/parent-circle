'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { ItemAgeGroup, ItemCondition, PostType } from '@/types/database';

const VALID_POST_TYPES: PostType[] = ['giveaway', 'borrow', 'exchange', 'sell', 'request'];

const MAX_PHOTOS = 10;

const CATEGORIES = ['Stroller', 'Toys', 'Clothes', 'Books', 'Feeding', 'Crib', 'Other'];
const POST_TYPES: { value: PostType; label: string }[] = [
  { value: 'giveaway', label: 'Give away' },
  { value: 'borrow', label: 'Lend / Borrow' },
  { value: 'exchange', label: 'Exchange' },
  { value: 'sell', label: 'Sell' },
  { value: 'request', label: 'Looking for' }
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
  const searchParams = useSearchParams();
  const supabase = createClient();

  const initialType = searchParams.get('type') as PostType | null;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [postType, setPostType] = useState<PostType>(
    initialType && VALID_POST_TYPES.includes(initialType) ? initialType : 'giveaway'
  );
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [ageGroup, setAgeGroup] = useState<ItemAgeGroup>('any');
  const [condition, setCondition] = useState<ItemCondition>('good');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  function handleFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!picked.length) return;
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}:${f.size}`));
      const next = [...prev];
      for (const f of picked) {
        const key = `${f.name}:${f.size}`;
        if (seen.has(key)) continue;
        if (next.length >= MAX_PHOTOS) break;
        next.push(f);
        seen.add(key);
      }
      return next;
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

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

    let priceValue: number | null = null;
    if (postType === 'sell') {
      const parsed = Number(price);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setError('Enter a price greater than 0.');
        setBusy(false);
        return;
      }
      priceValue = Math.round(parsed * 100) / 100;
    } else if (postType === 'request' && price.trim() !== '') {
      const parsed = Number(price);
      if (!Number.isFinite(parsed) || parsed < 0) {
        setError('Enter a budget of 0 or more, or leave it blank.');
        setBusy(false);
        return;
      }
      priceValue = Math.round(parsed * 100) / 100;
    }

    const imageUrls: string[] = [];
    for (const file of files) {
      const path = `items/${user.id}/${Date.now()}-${imageUrls.length}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { error: upErr } = await supabase.storage.from('images').upload(path, file);
      if (upErr) {
        setError(upErr.message);
        setBusy(false);
        return;
      }
      const { data: pub } = supabase.storage.from('images').getPublicUrl(path);
      imageUrls.push(pub.publicUrl);
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
        image_urls: imageUrls,
        price: priceValue,
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
      <h1 className="text-2xl font-semibold tracking-tight">
        {postType === 'request' ? 'Post a request' : 'Share an item'}
      </h1>
      <p className="text-sm text-slate-500">
        {postType === 'request'
          ? 'Tell the community what you need — someone nearby may have it.'
          : 'Give a stroller, lend a swing, or sell a barely-used crib.'}
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
        {postType === 'sell' || postType === 'request' ? (
          <div>
            <label className="label" htmlFor="price">
              {postType === 'sell' ? 'Proposed price (USD)' : 'Willing to pay (optional)'}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                $
              </span>
              <input
                id="price"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                required={postType === 'sell'}
                placeholder={postType === 'sell' ? '25.00' : 'Leave blank if free'}
                className="input pl-7"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            {postType === 'request' ? (
              <p className="mt-1 text-xs text-slate-500">
                Tell community members your budget, or leave blank if you&apos;re hoping for a giveaway.
              </p>
            ) : null}
          </div>
        ) : null}
        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="image">
              Photos
            </label>
            <span className="text-xs text-slate-500">
              {files.length} / {MAX_PHOTOS}
            </span>
          </div>
          <input
            id="image"
            type="file"
            accept="image/*"
            multiple
            disabled={files.length >= MAX_PHOTOS}
            onChange={handleFilesPicked}
            className="text-sm"
          />
          {previews.length ? (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {previews.map((src, i) => (
                <div key={src} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="h-20 w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    aria-label="Remove photo"
                    className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-slate-900/80 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Posting…' : postType === 'request' ? 'Post request' : 'Post item'}
        </button>
      </form>
    </div>
  );
}
