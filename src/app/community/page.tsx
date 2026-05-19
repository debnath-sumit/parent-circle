import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PostCard } from '@/components/PostCard';
import { EmptyState } from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

const CATEGORIES = [
  'All',
  'Baby health',
  'Food habits',
  'Sleep',
  'School',
  'Parenting tips',
  'Activities',
  'Emotional support'
];

export default async function CommunityPage({
  searchParams
}: {
  searchParams: { category?: string };
}) {
  const supabase = createClient();
  let query = supabase
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (searchParams.category && searchParams.category !== 'All') {
    query = query.eq('category', searchParams.category);
  }

  const { data: posts } = await query.limit(60);

  const authorIds = Array.from(new Set((posts ?? []).map((p) => p.author_id)));
  const authorsRes = authorIds.length
    ? await supabase.from('profiles').select('id, name, city').in('id', authorIds)
    : { data: [] };
  const authorMap = new Map((authorsRes.data ?? []).map((a) => [a.id, a]));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Community</h1>
          <p className="text-sm text-slate-500">
            Ask questions, share stories, get support from other parents.
          </p>
        </div>
        <Link href="/community/new" className="btn-primary">
          + New post
        </Link>
      </header>

      <form className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const active = (searchParams.category ?? 'All') === cat;
          return (
            <button
              key={cat}
              name="category"
              value={cat}
              type="submit"
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                active
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </form>

      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        ParentCircle is not a replacement for professional medical advice. Please consult
        healthcare professionals for medical concerns.
      </p>

      {!posts || posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          body="Be the first to start a conversation."
          ctaHref="/community/new"
          ctaLabel="Start a post"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} author={authorMap.get(p.author_id)} />
          ))}
        </div>
      )}
    </div>
  );
}
