# ParentCircle

> Parents helping parents grow together.

A community portal where parents can share baby/kid items, discuss parenting,
discover local activities, and message each other. Built with **Next.js 14**,
**TypeScript**, **Tailwind**, and **Supabase**.

## What's included (Phase 1 MVP)

- Email + password auth with email verification
- Parent profile & child profiles
- Give & Receive (item posts, image upload, search & filter)
- Community discussions (posts, comments, categories)
- One-to-one messaging with Supabase Realtime
- Activities placeholder section
- Mobile-friendly bottom nav

---

## 1. Local setup

```bash
npm install
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see step 2)
npm run dev
```

App runs on http://localhost:3000.

---

## 2. Supabase setup

1. Create a free project at https://supabase.com.
2. In **Project Settings → API**, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql) and click **Run**. This
   creates all tables, RLS policies, the `images` storage bucket, and the
   `handle_new_user` trigger that auto-creates a profile row on signup.
4. Configure **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` (and your Vercel URL once deployed)
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` and
     `https://YOUR-VERCEL-URL/auth/callback`.
5. **Authentication → Providers → Email**: make sure **Confirm email** is
   enabled — Supabase will send the verification email automatically.
6. (Optional) **Authentication → Email Templates**: customize the confirmation
   email branding.
7. (Optional) **Database → Replication**: enable Realtime for the `messages`
   table so chat updates live.

You can use Supabase's built-in SMTP for development. For production traffic,
configure a custom SMTP provider under **Project Settings → Auth → SMTP**.

---

## 3. Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New → Project** and import the repo.
3. Framework preset: **Next.js** (auto-detected).
4. Add the environment variables under **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` → set to your production URL (e.g.
     `https://parent-circle.vercel.app`).
5. Click **Deploy**.
6. After the first deploy, copy the production URL and add it to Supabase's
   **Site URL** and **Redirect URLs** (step 2.4 above), then redeploy if
   needed.

---

## Project structure

```
.
├── middleware.ts              # Supabase auth session refresh
├── supabase/schema.sql        # Database tables, RLS, storage bucket
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Home dashboard / landing
│   │   ├── login/
│   │   ├── signup/
│   │   ├── auth/{callback,signout}/
│   │   ├── profile/
│   │   ├── give-receive/{,new,[id]}/
│   │   ├── community/{,new,[id]}/
│   │   ├── messages/{,[userId]}/
│   │   └── activities/
│   ├── components/            # TopBar, BottomNav, cards, etc.
│   ├── lib/supabase/          # Browser, server, middleware clients
│   └── types/database.ts      # Row + Database typings
└── tailwind.config.ts
```

---

## Roadmap

- **Phase 2** — push notifications, activity directory, play dates, school
  reviews
- **Phase 3** — AI recommendations, sponsored listings, marketplace payments
