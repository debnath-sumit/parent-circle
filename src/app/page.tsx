import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SectionHeader } from '@/components/SectionHeader';
import { ItemCard } from '@/components/ItemCard';
import { PostCard } from '@/components/PostCard';
import { EmptyState } from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return <Landing />;
  }

  const [profileRes, childrenRes, itemsRes, postsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('children').select('*').eq('parent_id', user.id),
    supabase
      .from('items')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4)
  ]);

  const profile = profileRes.data;
  const children = childrenRes.data ?? [];
  const items = itemsRes.data ?? [];
  const posts = postsRes.data ?? [];
  const greetingName = profile?.name || user.email?.split('@')[0] || 'parent';

  return (
    <div className="space-y-8">
      <header className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-md">
        <p className="text-sm font-medium text-brand-100">Welcome back</p>
        <h1 className="mt-1 text-2xl font-semibold">Hi {greetingName} 👋</h1>
        <p className="mt-2 max-w-xl text-sm text-brand-50">
          Parents helping parents grow together. Find a play date, give a stroller a new home,
          or get advice from a fellow parent.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/give-receive/new" className="btn-secondary !text-brand-700">
            Share an item
          </Link>
          <Link href="/community/new" className="btn-secondary !text-brand-700">
            Start a discussion
          </Link>
        </div>
      </header>

      <section>
        <SectionHeader title="Your children" href="/profile" cta="Manage →" />
        {children.length === 0 ? (
          <EmptyState
            title="Add your first child"
            body="Tell us their age group so we can recommend the right activities and items."
            ctaHref="/profile"
            ctaLabel="Add a child"
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {children.map((c) => (
              <span key={c.id} className="chip">
                {c.name} · {c.age_group}
              </span>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Nearby items" href="/give-receive" />
        {items.length === 0 ? (
          <EmptyState
            title="No items yet"
            body="Be the first to share something a fellow parent could use."
            ctaHref="/give-receive/new"
            ctaLabel="Share an item"
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <ItemCard key={it.id} item={it} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Recent community posts" href="/community" />
        {posts.length === 0 ? (
          <EmptyState
            title="The community is quiet"
            body="Ask a question or share something with other parents."
            ctaHref="/community/new"
            ctaLabel="Start a post"
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </section>

      <p className="text-center text-xs text-slate-400">
        ParentCircle is not a replacement for professional medical advice. Please consult
        healthcare professionals for medical concerns.
      </p>
    </div>
  );
}

function Landing() {
  return (
    <div className="py-10">
      <section className="rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-10 text-center text-white shadow-lg">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Parents helping parents grow together.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-brand-50 sm:text-base">
          Share baby items, find local classes, organize play dates, and connect with parents
          near you. From newborn to teen — we&apos;ve got you.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/signup" className="btn-primary !bg-white !text-brand-700">
            Create your free account
          </Link>
          <Link href="/login" className="btn-secondary !border-white !text-white !bg-transparent">
            I already have one
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: 'Give & Receive',
            body: 'Share strollers, toys, clothes and more with parents nearby.'
          },
          {
            title: 'Community',
            body: 'Get advice on sleep, food, school — from parents who&apos;ve been there.'
          },
          {
            title: 'Activities & Play dates',
            body: 'Discover classes from music to STEM, and meet up at the park.'
          }
        ].map((f) => (
          <div key={f.title} className="card">
            <h3 className="text-base font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-500" dangerouslySetInnerHTML={{ __html: f.body }} />
          </div>
        ))}
      </section>
    </div>
  );
}
