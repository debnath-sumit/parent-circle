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
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-white/20 ring-2 ring-white/40">
            {profile?.profile_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profile_image}
                alt={greetingName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl">👤</div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-brand-100">Welcome back</p>
            <h1 className="mt-1 text-2xl font-semibold">Hi {greetingName} 👋</h1>
          </div>
        </div>
        <p className="mt-3 max-w-xl text-sm text-brand-50">
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
  const benefits = [
    {
      icon: '♻️',
      title: 'Save money. Skip the landfill.',
      body: 'Kids outgrow strollers, cribs, and toys in months. Pass them on — and pick up what you need from neighbors, free or cheap.'
    },
    {
      icon: '🙋',
      title: 'Ask 100 parents at once',
      body: 'Need a bassinet by Friday? A booster seat for grandma\'s house? Post a request and let the community come to you.'
    },
    {
      icon: '💬',
      title: 'Real advice, real parents',
      body: 'Sleep regressions, picky eaters, first day of school — get tips from parents who lived it last month, not random forum strangers.'
    },
    {
      icon: '🤝',
      title: 'Build your village',
      body: 'Find play dates, local classes, and parents on the same stage as you. From newborn to teen — you\'re not doing this alone.'
    }
  ];

  const steps = [
    { n: 1, title: 'Create your free account', body: 'Add your kids\' age groups so we can match you with what\'s relevant.' },
    { n: 2, title: 'Browse, share, or ask', body: 'Take a free stroller, offer outgrown books, or post "Looking for…" for what you need.' },
    { n: 3, title: 'Meet up & message', body: 'Chat privately with neighbors, swap items, and grow your circle.' }
  ];

  const examples = [
    'Looking for a toddler stroller',
    'Free crib — pickup this weekend',
    'Best swim class in the area?',
    'Lending a Bumbo seat (3–9m)',
    'Anyone tried sleep training at 6m?',
    'Selling outgrown winter coat — $15'
  ];

  return (
    <div className="space-y-12 py-6">
      <section className="rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-8 text-center text-white shadow-lg sm:p-12">
        <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide">
          For parents, by parents
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
          The village every parent <span className="italic">actually</span> needs.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-brand-50 sm:text-base">
          Borrow a stroller from a neighbor. Find a play date for Saturday. Ask the real
          question you can&apos;t Google. ParentCircle is the local, parent-only network for
          everything raising kids actually takes.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/signup" className="btn-primary !bg-white !text-brand-700">
            Join free — takes 30 seconds
          </Link>
          <Link
            href="/login"
            className="btn-secondary !border-white !text-white !bg-transparent hover:!bg-white/10"
          >
            I already have an account
          </Link>
        </div>
        <p className="mt-4 text-xs text-brand-100">
          No ads. No data sold. Just parents helping parents.
        </p>
      </section>

      <section>
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          Why parents love ParentCircle
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-500">
          Four things every parent wishes they had — in one app.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {benefits.map((b) => (
            <div key={b.title} className="card">
              <div className="text-3xl">{b.icon}</div>
              <h3 className="mt-3 text-base font-semibold">{b.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-brand-100 bg-white p-6 sm:p-10">
        <h2 className="text-center text-2xl font-semibold tracking-tight">How it works</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-brand-500 text-sm font-semibold text-white">
                {s.n}
              </div>
              <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          What parents are asking & sharing today
        </h2>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {examples.map((e) => (
            <span
              key={e}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm"
            >
              {e}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-brand-50 p-8 text-center sm:p-12">
        <h2 className="text-2xl font-semibold tracking-tight text-brand-800 sm:text-3xl">
          Raising kids is easier together.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
          Join the parents around you who are already lending, asking, and showing up for
          each other.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/signup" className="btn-primary">
            Create your free account
          </Link>
          <Link href="/login" className="btn-secondary">
            Sign in
          </Link>
        </div>
      </section>
    </div>
  );
}
