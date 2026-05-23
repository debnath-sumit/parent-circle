'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Message } from '@/types/database';

export function ChatThread({
  currentUserId,
  partnerId,
  initialMessages
}: {
  currentUserId: string;
  partnerId: string;
  initialMessages: Message[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let cancelled = false;
    async function markRead() {
      const { data } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('receiver_id', currentUserId)
        .eq('sender_id', partnerId)
        .is('read_at', null)
        .select('id');
      if (!cancelled && data && data.length > 0) {
        router.refresh();
      }
    }
    markRead();
    return () => {
      cancelled = true;
    };
  }, [supabase, router, currentUserId, partnerId, messages.length]);

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${currentUserId}:${partnerId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const m = payload.new as Message;
          const isThisThread =
            (m.sender_id === currentUserId && m.receiver_id === partnerId) ||
            (m.sender_id === partnerId && m.receiver_id === currentUserId);
          if (isThisThread) {
            setMessages((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m]));
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, currentUserId, partnerId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError(null);
    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: currentUserId, receiver_id: partnerId, body: body.trim() })
      .select()
      .single();
    setBusy(false);
    if (error || !data) {
      setError(error?.message ?? 'Failed to send.');
      return;
    }
    setMessages((prev) => (prev.some((p) => p.id === data.id) ? prev : [...prev, data]));
    setBody('');
  }

  return (
    <div className="space-y-3">
      <div className="card max-h-[60vh] overflow-y-auto !p-3">
        {messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">
            Say hi 👋 — start the conversation.
          </p>
        ) : (
          <ul className="space-y-2">
            {messages.map((m) => {
              const mine = m.sender_id === currentUserId;
              return (
                <li key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      mine
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        mine ? 'text-brand-100' : 'text-slate-500'
                      }`}
                    >
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex items-center gap-2">
        <input
          className="input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message…"
        />
        <button type="submit" disabled={busy || !body.trim()} className="btn-primary">
          Send
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
