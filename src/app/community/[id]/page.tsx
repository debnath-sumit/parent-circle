import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PhotoGallery } from '@/components/PhotoGallery';
import { DeleteRecordButton } from '@/components/DeleteRecordButton';
import { CommentForm } from './CommentForm';

export const dynamic = 'force-dynamic';

export default async function CommunityPostDetail({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: post } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();
  if (!post) notFound();

  const [{ data: author }, { data: comments }, { data: { user } }] = await Promise.all([
    supabase.from('profiles').select('id, name, city').eq('id', post.author_id).maybeSingle(),
    supabase
      .from('comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true }),
    supabase.auth.getUser()
  ]);

  const commentAuthorIds = Array.from(new Set((comments ?? []).map((c) => c.author_id)));
  const authorsRes = commentAuthorIds.length
    ? await supabase.from('profiles').select('id, name').in('id', commentAuthorIds)
    : { data: [] };
  const authorMap = new Map((authorsRes.data ?? []).map((a) => [a.id, a]));

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-2">
      <Link href="/community" className="text-sm text-brand-600">
        ← Back to community
      </Link>

      <article className="card">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="chip">{post.category}</span>
          <span>{new Date(post.created_at).toLocaleString()}</span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{post.title}</h1>
        {post.image_urls && post.image_urls.length > 0 ? (
          <div className="mt-3">
            <PhotoGallery
              urls={post.image_urls}
              heroClassName="mb-2 max-h-96 w-full rounded-xl object-cover"
            />
          </div>
        ) : null}
        <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{post.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            By {author?.name ?? 'A parent'}
            {author?.city ? ` · ${author.city}` : ''}
          </p>
          {user?.id === post.author_id ? (
            <DeleteRecordButton
              table="community_posts"
              id={post.id}
              redirectTo="/community"
              confirmText="Delete this post? This can't be undone."
              label="Delete post"
            />
          ) : null}
        </div>
      </article>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">
          {comments?.length ?? 0} {(comments?.length ?? 0) === 1 ? 'comment' : 'comments'}
        </h2>
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
          <CommentForm postId={post.id} />
        ) : (
          <p className="text-sm text-slate-500">
            <Link href="/login" className="text-brand-600">
              Sign in
            </Link>{' '}
            to add a comment.
          </p>
        )}
      </section>
    </div>
  );
}
