import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(200);

  const partners = new Map<string, { lastBody: string; lastAt: string }>();
  for (const m of messages ?? []) {
    const partnerId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
    if (!partners.has(partnerId)) {
      partners.set(partnerId, { lastBody: m.body, lastAt: m.created_at });
    }
  }

  const partnerIds = Array.from(partners.keys());
  const profilesRes = partnerIds.length
    ? await supabase.from('profiles').select('id, name, city').in('id', partnerIds)
    : { data: [] };
  const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-slate-500">Talk privately with other parents.</p>
      </header>

      {partnerIds.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          body="Start a chat from an item or community post."
          ctaHref="/give-receive"
          ctaLabel="Browse items"
        />
      ) : (
        <ul className="space-y-2">
          {partnerIds.map((pid) => {
            const meta = partners.get(pid)!;
            const profile = profileMap.get(pid);
            return (
              <li key={pid}>
                <Link
                  href={`/messages/${pid}`}
                  className="card flex items-center justify-between hover:border-brand-200"
                >
                  <div>
                    <p className="text-sm font-semibold">{profile?.name ?? 'Parent'}</p>
                    <p className="line-clamp-1 text-xs text-slate-500">{meta.lastBody}</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {new Date(meta.lastAt).toLocaleDateString()}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
