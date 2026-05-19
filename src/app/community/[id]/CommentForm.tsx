'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [body, setBody] = useState('');
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
      setError('Sign in to comment.');
      setBusy(false);
      return;
    }
    const { error } = await supabase
      .from('comments')
      .insert({ post_id: postId, author_id: user.id, body });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setBody('');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <label className="label" htmlFor="comment">
        Add a comment
      </label>
      <textarea
        id="comment"
        required
        rows={3}
        className="input"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={busy} className="btn-primary self-start">
        {busy ? 'Posting…' : 'Post comment'}
      </button>
    </form>
  );
}
