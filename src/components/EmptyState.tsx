import Link from 'next/link';

export function EmptyState({
  title,
  body,
  ctaHref,
  ctaLabel
}: {
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="card flex flex-col items-center text-center">
      <div className="mb-3 text-3xl">🌱</div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{body}</p>
      {ctaHref && ctaLabel ? (
        <Link href={ctaHref} className="btn-primary mt-4">
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
