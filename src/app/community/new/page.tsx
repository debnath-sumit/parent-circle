'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
      const path = `posts/${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { error: upErr } = await supabase.storage.from('images').upload(path, file);
      if (upErr) {
        setError(upErr.message);
        setBusy(false);
        return;
      }
      imageUrl = supabase.storage.from('images').getPublicUrl(path).data.publicUrl;
    }

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        author_id: user.id,
        category,
        title,
        body,
        image_url: imageUrl,
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
          <label className="label" htmlFor="image">
            Photo (optional)
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
          {busy ? 'Posting…' : 'Publish'}
        </button>
      </form>
    </div>
  );
}
