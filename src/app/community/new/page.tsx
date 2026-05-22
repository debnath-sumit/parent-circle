'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const MAX_PHOTOS = 10;

const CATEGORIES = [
  'Baby health',
  'Food habits',
  'Sleep',
  'School',
  'Parenting tips',
  'Activities',
  'Emotional support'
];

export default function NewCommunityPostPage() {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState('');
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

    const imageUrls: string[] = [];
    for (const file of files) {
      const path = `posts/${user.id}/${Date.now()}-${imageUrls.length}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { error: upErr } = await supabase.storage.from('images').upload(path, file);
      if (upErr) {
        setError(upErr.message);
        setBusy(false);
        return;
      }
      imageUrls.push(supabase.storage.from('images').getPublicUrl(path).data.publicUrl);
    }

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        author_id: user.id,
        category,
        title,
        body,
        image_urls: imageUrls,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      })
      .select()
      .single();

    setBusy(false);
    if (error || !data) {
      setError(error?.message ?? 'Failed to post.');
      return;
    }
    router.push(`/community/${data.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl py-4">
      <h1 className="text-2xl font-semibold tracking-tight">New community post</h1>
      <form onSubmit={handleSubmit} className="card mt-6 space-y-4">
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
          <label className="label" htmlFor="body">
            What&apos;s on your mind?
          </label>
          <textarea
            id="body"
            required
            rows={6}
            className="input"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="tags">
            Tags (comma separated)
          </label>
          <input
            id="tags"
            className="input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="newborn, sleep training"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="image">
              Photos (optional)
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
          {busy ? 'Posting…' : 'Publish'}
        </button>
      </form>
    </div>
  );
}
