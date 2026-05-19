import type { Metadata } from 'next';
import './globals.css';
import { BottomNav } from '@/components/BottomNav';
import { TopBar } from '@/components/TopBar';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'ParentCircle — Parents helping parents grow together',
  description:
    'A community-driven portal for parents to share, support, and discover activities for kids of every age.'
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="min-h-screen pb-24">
        <TopBar isAuthed={Boolean(user)} />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        {user ? <BottomNav /> : null}
      </body>
    </html>
  );
}
