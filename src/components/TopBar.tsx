import Link from 'next/link';

export function TopBar({
  isAuthed,
  unreadMessages = 0
}: {
  isAuthed: boolean;
  unreadMessages?: number;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500 text-white font-bold">
            P
          </span>
          <span className="text-lg font-semibold tracking-tight">ParentCircle</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {isAuthed ? (
            <>
              <Link href="/messages" className="btn-ghost relative">
                Messages
                {unreadMessages > 0 ? (
                  <span className="ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold leading-[18px] text-white">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                ) : null}
              </Link>
              <Link href="/profile" className="btn-ghost">
                Profile
              </Link>
              <form action="/auth/signout" method="post">
                <button className="btn-secondary" type="submit">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary">
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
