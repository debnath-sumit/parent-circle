'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function DeleteRecordButton({
  table,
  id,
  redirectTo,
  confirmText,
  label = 'Delete'
}: {
  table: 'community_posts' | 'items';
  id: string;
  redirectTo: string;
  confirmText: string;
  label?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="inline-flex flex-col items-end">
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        {busy ? 'Deleting…' : label}
      </button>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
