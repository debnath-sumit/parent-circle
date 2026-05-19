import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ChatThread } from './ChatThread';

export const dynamic = 'force-dynamic';

export default async function ChatPage({ params }: { params: { userId: string } }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  if (user.id === params.userId) {
    redirect('/messages');
  }

  const [{ data: partner }, { data: history }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, city')
      .eq('id', params.userId)
      .maybeSingle(),
    supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${params.userId}),and(sender_id.eq.${params.userId},receiver_id.eq.${user.id})`
      )
      .order('created_at', { ascending: true })
      .limit(500)
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-4 py-2">
      <Link href="/messages" className="text-sm text-brand-600">
        ← Back to messages
      </Link>
      <header className="card !py-3">
        <h1 className="text-base font-semibold">
          {partner?.name ?? 'Parent'}
          {partner?.city ? <span className="ml-2 text-xs text-slate-500">{partner.city}</span> : null}
        </h1>
      </header>
      <ChatThread
        currentUserId={user.id}
        partnerId={params.userId}
        initialMessages={history ?? []}
      />
    </div>
  );
}
