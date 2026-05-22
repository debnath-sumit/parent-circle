'use client';

import { useState } from 'react';

export function PhotoGallery({
  urls,
  alt = '',
  heroClassName = 'mb-4 h-72 w-full rounded-xl object-cover'
}: {
  urls: string[];
  alt?: string;
  heroClassName?: string;
}) {
  const [active, setActive] = useState(0);
  if (!urls.length) return null;
  const current = urls[Math.min(active, urls.length - 1)];

  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={current} alt={alt} className={heroClassName} />
      {urls.length > 1 ? (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {urls.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active ? 'border-brand-500' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
