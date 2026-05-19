import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ItemCard } from '@/components/ItemCard';
import { EmptyState } from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

const CATEGORIES = ['All', 'Stroller', 'Toys', 'Clothes', 'Books', 'Feeding', 'Crib', 'Other'];

export default async function GiveReceivePage({
  searchParams
}: {
  searchParams: { category?: string; q?: string };
}) {
  const supabase = createClient();
  let query = supabase
    .from('items')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false });

  if (searchParams.category && searchParams.category !== 'All') {
    query = query.eq('category', searchParams.category);
  }
  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`);
  }

  const { data: items } = await query.limit(60);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Give &amp; Receive</h1>
          <p className="text-sm text-slate-500">
            Share what your kids have outgrown. Borrow what you need today.
          </p>
        </div>
        <Link href="/give-receive/new" className="btn-primary">
          + Share item
        </Link>
      </header>

      <form className="flex flex-col gap-3 sm:flex-row">
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
          title="No items match yet"
          body="Be the first to share something — a stroller, a swing, a stack of books."
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
    </div>
  );
}
