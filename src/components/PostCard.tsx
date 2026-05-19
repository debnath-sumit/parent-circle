import Link from 'next/link';
import type { CommunityPost, Profile } from '@/types/database';

export function PostCard({
  post,
  author
}: {
  post: CommunityPost;
  author?: Pick<Profile, 'name' | 'city'> | null;
}) {
  return (
    <Link href={`/community/${post.id}`} className="card block hover:border-brand-200">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="chip">{post.category}</span>
        <span>{new Date(post.created_at).toLocaleDateString()}</span>
      </div>
      <h3 className="mt-2 text-base font-semibold leading-snug">{post.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{post.body}</p>
      {author ? (
        <p className="mt-3 text-xs text-slate-500">
          By {author.name ?? 'A parent'}
          {author.city ? ` · ${author.city}` : ''}
        </p>
      ) : null}
    </Link>
  );
}
