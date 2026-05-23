'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/community', label: 'Community', icon: '💬' },
  { href: '/give-receive', label: 'Give & Receive', icon: '🎁' },
  { href: '/messages', label: 'Messages', icon: '✉️' },
  { href: '/activities', label: 'Activities', icon: '⚽️' },
  { href: '/profile', label: 'Profile', icon: '👤' }
];

export function BottomNav({ unreadMessages = 0 }: { unreadMessages?: number }) {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-stretch justify-between px-2">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const showBadge = item.href === '/messages' && unreadMessages > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
                active ? 'text-brand-600' : 'text-slate-500'
              }`}
            >
              <span className="relative text-lg leading-none">
                {item.icon}
                {showBadge ? (
                  <span className="absolute -right-3 -top-1 min-w-[18px] rounded-full bg-brand-500 px-1 text-[10px] font-semibold leading-[18px] text-white">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                ) : null}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
