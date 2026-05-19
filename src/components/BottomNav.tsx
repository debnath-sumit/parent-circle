'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/community', label: 'Community', icon: '💬' },
  { href: '/give-receive', label: 'Give & Receive', icon: '🎁' },
  { href: '/activities', label: 'Activities', icon: '⚽️' },
  { href: '/profile', label: 'Profile', icon: '👤' }
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-stretch justify-between px-2">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
                active ? 'text-brand-600' : 'text-slate-500'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
