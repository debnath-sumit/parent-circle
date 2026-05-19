import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from './ProfileForm';
import { ChildrenSection } from './ChildrenSection';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: profile }, { data: children }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('children').select('*').eq('parent_id', user.id).order('created_at')
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
        <p className="text-sm text-slate-500">Help other parents find you and your kids.</p>
      </header>

      <ProfileForm
        initial={{
          name: profile?.name ?? '',
          city: profile?.city ?? '',
          interests: (profile?.interests ?? []).join(', ')
        }}
      />

      <ChildrenSection initial={children ?? []} />
    </div>
  );
}
