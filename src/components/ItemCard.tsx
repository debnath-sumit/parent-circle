import Link from 'next/link';
import type { Item } from '@/types/database';

const postTypeLabels: Record<Item['post_type'], string> = {
  giveaway: 'Give away',
  borrow: 'Borrow',
  exchange: 'Exchange',
  sell: 'Sell'
};

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/give-receive/${item.id}`} className="card block hover:border-brand-200">
      {item.image_urls && item.image_urls.length > 0 ? (
        <div className="relative mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image_urls[0]}
            alt={item.title}
            className="h-40 w-full rounded-xl object-cover"
          />
          {item.image_urls.length > 1 ? (
            <span className="absolute right-2 top-2 rounded-full bg-slate-900/70 px-2 py-0.5 text-xs text-white">
              +{item.image_urls.length - 1}
            </span>
          ) : null}
        </div>
      ) : (
        <div className="mb-3 grid h-40 w-full place-items-center rounded-xl bg-brand-50 text-4xl">
          🎁
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
        <span className="chip">{postTypeLabels[item.post_type]}</span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
        <span>{item.category}</span>
        {item.location ? <span>· {item.location}</span> : null}
      </div>
    </Link>
  );
}
