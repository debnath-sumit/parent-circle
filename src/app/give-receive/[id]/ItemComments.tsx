import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ItemCommentForm } from './ItemCommentForm';

export async function ItemComments({
  itemId,
  isRequest
}: {
  itemId: string;
  isRequest: boolean;
}) {
  const supabase = createClient();
  const [{ data: comments }, { data: { user } }] = await Promise.all([
    supabase
      .from('comments')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: true }),
    supabase.auth.getUser()
  ]);

  const authorIds = Array.from(new Set((comments ?? []).map((c) => c.author_id)));
  const authorsRes = authorIds.length
    ? await supabase.from('profiles').select('id, name').in('id', authorIds)
    : { data: [] };
  const authorMap = new Map((authorsRes.data ?? []).map((a) => [a.id, a]));

  const count = comments?.length ?? 0;
  const heading = isRequest
    ? `${count} ${count === 1 ? 'offer' : 'offers'}`
    : `${count} ${count === 1 ? 'comment' : 'comments'}`;
  const placeholder = isRequest
    ? "I have one you can borrow / take — let me know!"
    : 'Add a comment';

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">{heading}</h2>
      {(comments ?? []).map((c) => (
        <div key={c.id} className="card !p-4">
          <p className="text-xs text-slate-500">
            {authorMap.get(c.author_id)?.name ?? 'A parent'} ·{' '}
            {new Date(c.created_at).toLocaleString()}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{c.body}</p>
        </div>
      ))}

      {user ? (
        <ItemCommentForm itemId={itemId} placeholder={placeholder} />
      ) : (
        <p className="text-sm text-slate-500">
          <Link href="/login" className="text-brand-600">
            Sign in
          </Link>{' '}
          to reply publicly{isRequest ? ' or offer your help' : ''}.
        </p>
      )}
    </section>
  );
}
