import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ItemCard } from '@/components/ItemCard';
import { EmptyState } from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

const CATEGORIES = ['All', 'Stroller', 'Toys', 'Clothes', 'Books', 'Feeding', 'Crib', 'Other'];
const KINDS: { value: 'all' | 'offers' | 'requests'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'offers', label: 'Offers' },
  { value: 'requests', label: 'Looking for' }
];
const OFFER_TYPES = ['giveaway', 'borrow', 'exchange', 'sell'];

export default async function GiveReceivePage({
  searchParams
}: {
  searchParams: { category?: string; q?: string; kind?: string };
}) {
  const supabase = createClient();
  const kind = (searchParams.kind ?? 'all') as 'all' | 'offers' | 'requests';

  let query = supabase
    .from('items')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false });

  if (kind === 'requests') {
    query = query.eq('post_type', 'request');
  } else if (kind === 'offers') {
    query = query.in('post_type', OFFER_TYPES);
  }
  if (searchParams.category && searchParams.category !== 'All') {
    query = query.eq('category', searchParams.category);
  }
  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`);
  }

  const { data: items } = await query.limit(60);

  const ctaHref =
    kind === 'requests' ? '/give-receive/new?type=request' : '/give-receive/new';
  const ctaLabel = kind === 'requests' ? '+ Post request' : '+ Share item';

  const emptyTitle =
    kind === 'requests' ? 'No open requests yet' : 'No items match yet';
  const emptyBody =
    kind === 'requests'
      ? "Looking for something? Post a request — a neighbor may have it."
      : 'Be the first to share something — a stroller, a swing, a stack of books.';
  const emptyCtaLabel = kind === 'requests' ? 'Post a request' : 'Share an item';

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Give &amp; Receive</h1>
          <p className="text-sm text-slate-500">
            Share what your kids have outgrown, or ask the community for what you need.
          </p>
        </div>
        <Link href={ctaHref} className="btn-primary">
          {ctaLabel}
        </Link>
      </header>

      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => {
          const active = kind === k.value;
          const params = new URLSearchParams();
          if (k.value !== 'all') params.set('kind', k.value);
          if (searchParams.category) params.set('category', searchParams.category);
          if (searchParams.q) params.set('q', searchParams.q);
          const href = `/give-receive${params.toString() ? `?${params.toString()}` : ''}`;
          return (
            <Link
              key={k.value}
              href={href}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                active
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {k.label}
            </Link>
          );
        })}
      </div>

      <form className="flex flex-col gap-3 sm:flex-row">
        {kind !== 'all' ? <input type="hidden" name="kind" value={kind} /> : null}
        <input
          name="q"
          defaultValue={searchParams.q ?? ''}
          placeholder="Search items…"
          className="input sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
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
        </div>
      </form>

      {!items || items.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          body={emptyBody}
          ctaHref={ctaHref}
          ctaLabel={emptyCtaLabel}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <ItemCard key={it.id} item={it} />
          ))}
        </div>
      )}
    </div>
  );
}
