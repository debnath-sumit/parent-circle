import Link from 'next/link';

export function SectionHeader({
  title,
  href,
  cta
}: {
  title: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {href ? (
        <Link href={href} className="text-sm font-medium text-brand-600 hover:text-brand-700">
          {cta ?? 'See all →'}
        </Link>
      ) : null}
    </div>
  );
}
