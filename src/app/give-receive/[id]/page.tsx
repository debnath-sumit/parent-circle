import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PhotoGallery } from '@/components/PhotoGallery';

export const dynamic = 'force-dynamic';

const postTypeLabels: Record<string, string> = {
  giveaway: 'Give away',
  borrow: 'Borrow',
  exchange: 'Exchange',
  sell: 'Sell'
};

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: item } = await supabase
    .from('items')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();
  if (!item) notFound();

  const { data: owner } = await supabase
    .from('profiles')
    .select('id, name, city')
    .eq('id', item.owner_id)
    .maybeSingle();

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const isOwner = user?.id === item.owner_id;

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-2">
      <Link href="/give-receive" className="text-sm text-brand-600">
        ← Back to items
      </Link>

      <div className="card">
        {item.image_urls && item.image_urls.length > 0 ? (
          <PhotoGallery urls={item.image_urls} alt={item.title} />
        ) : (
          <div className="mb-4 grid h-72 w-full place-items-center rounded-xl bg-brand-50 text-6xl">
            🎁
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">{postTypeLabels[item.post_type]}</span>
          <span className="chip">{item.category}</span>
          {item.condition ? <span className="chip">{item.condition}</span> : null}
          {item.age_group !== 'any' ? <span className="chip">{item.age_group}</span> : null}
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{item.title}</h1>
        {item.location ? (
          <p className="text-sm text-slate-500">📍 {item.location}</p>
        ) : null}

        {item.description ? (
          <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{item.description}</p>
        ) : null}

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
          <div className="text-sm">
            <p className="text-slate-500">Shared by</p>
            <p className="font-medium">
              {owner?.name ?? 'A parent'}
              {owner?.city ? ` · ${owner.city}` : ''}
            </p>
          </div>
          {!isOwner && user && owner ? (
            <Link href={`/messages/${owner.id}`} className="btn-primary">
              Message
            </Link>
          ) : null}
          {isOwner ? <span className="chip">Your post</span> : null}
        </div>
      </div>
    </div>
  );
}
