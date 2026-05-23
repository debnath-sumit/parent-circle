-- ParentCircle database schema
-- Run this in the Supabase SQL Editor for a fresh project.

-- =========================================================================
-- EXTENSIONS
-- =========================================================================
create extension if not exists "uuid-ossp";

-- =========================================================================
-- PROFILES (one row per auth user)
-- =========================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  city text,
  profile_image text,
  interests text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================================
-- CHILDREN
-- =========================================================================
create table if not exists public.children (
  id uuid primary key default uuid_generate_v4(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  age_group text check (age_group in ('baby', 'kid', 'teen')) not null,
  birth_year int,
  birth_month int,
  interests text[],
  created_at timestamptz not null default now()
);

alter table public.children enable row level security;

drop policy if exists "Children visible to everyone" on public.children;
create policy "Children visible to everyone"
  on public.children for select using (true);

drop policy if exists "Parent can manage own children" on public.children;
create policy "Parent can manage own children"
  on public.children for all using (auth.uid() = parent_id) with check (auth.uid() = parent_id);

-- =========================================================================
-- ITEMS (Give & Receive)
-- =========================================================================
create table if not exists public.items (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  post_type text not null check (post_type in ('giveaway', 'borrow', 'exchange', 'sell', 'request')),
  category text not null,
  title text not null,
  description text,
  age_group text check (age_group in ('baby', 'kid', 'teen', 'any')) default 'any',
  condition text check (condition in ('new', 'like-new', 'good', 'fair')),
  location text,
  image_urls text[] not null default '{}',
  price numeric(10,2) check (price is null or price >= 0),
  status text not null default 'available' check (status in ('available', 'reserved', 'taken')),
  created_at timestamptz not null default now()
);

create index if not exists items_owner_idx on public.items(owner_id);
create index if not exists items_status_idx on public.items(status);

alter table public.items enable row level security;

drop policy if exists "Items visible to everyone" on public.items;
create policy "Items visible to everyone"
  on public.items for select using (true);

drop policy if exists "Owner can insert items" on public.items;
create policy "Owner can insert items"
  on public.items for insert with check (auth.uid() = owner_id);

drop policy if exists "Owner can update items" on public.items;
create policy "Owner can update items"
  on public.items for update using (auth.uid() = owner_id);

drop policy if exists "Owner can delete items" on public.items;
create policy "Owner can delete items"
  on public.items for delete using (auth.uid() = owner_id);

-- =========================================================================
-- COMMUNITY POSTS
-- =========================================================================
create table if not exists public.community_posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  title text not null,
  body text not null,
  image_urls text[] not null default '{}',
  tags text[],
  created_at timestamptz not null default now()
);

create index if not exists community_posts_author_idx on public.community_posts(author_id);
create index if not exists community_posts_created_idx on public.community_posts(created_at desc);

alter table public.community_posts enable row level security;

drop policy if exists "Posts visible to everyone" on public.community_posts;
create policy "Posts visible to everyone"
  on public.community_posts for select using (true);

drop policy if exists "Author can insert posts" on public.community_posts;
create policy "Author can insert posts"
  on public.community_posts for insert with check (auth.uid() = author_id);

drop policy if exists "Author can update posts" on public.community_posts;
create policy "Author can update posts"
  on public.community_posts for update using (auth.uid() = author_id);

drop policy if exists "Author can delete posts" on public.community_posts;
create policy "Author can delete posts"
  on public.community_posts for delete using (auth.uid() = author_id);

-- =========================================================================
-- COMMENTS
-- =========================================================================
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.community_posts(id) on delete cascade,
  item_id uuid references public.items(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint comments_target_check check (
    (post_id is not null and item_id is null)
    or (post_id is null and item_id is not null)
  )
);

-- For projects upgrading from an earlier schema where post_id was NOT NULL.
alter table public.comments alter column post_id drop not null;
alter table public.comments add column if not exists item_id uuid references public.items(id) on delete cascade;
alter table public.comments drop constraint if exists comments_target_check;
alter table public.comments add constraint comments_target_check check (
  (post_id is not null and item_id is null)
  or (post_id is null and item_id is not null)
);

create index if not exists comments_post_idx on public.comments(post_id);
create index if not exists comments_item_idx on public.comments(item_id);

alter table public.comments enable row level security;

drop policy if exists "Comments visible to everyone" on public.comments;
create policy "Comments visible to everyone"
  on public.comments for select using (true);

drop policy if exists "Author can insert comments" on public.comments;
create policy "Author can insert comments"
  on public.comments for insert with check (auth.uid() = author_id);

drop policy if exists "Author can delete comments" on public.comments;
create policy "Author can delete comments"
  on public.comments for delete using (auth.uid() = author_id);

-- =========================================================================
-- MESSAGES (one-to-one direct messages)
-- =========================================================================
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- For projects upgrading from an earlier schema without read_at.
alter table public.messages add column if not exists read_at timestamptz;

create index if not exists messages_sender_idx on public.messages(sender_id);
create index if not exists messages_receiver_idx on public.messages(receiver_id);
create index if not exists messages_receiver_unread_idx
  on public.messages(receiver_id)
  where read_at is null;

alter table public.messages enable row level security;

drop policy if exists "Participants can read messages" on public.messages;
create policy "Participants can read messages"
  on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Sender can insert message" on public.messages;
create policy "Sender can insert message"
  on public.messages for insert with check (auth.uid() = sender_id);

drop policy if exists "Receiver can mark read" on public.messages;
create policy "Receiver can mark read"
  on public.messages for update
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);

-- =========================================================================
-- STORAGE BUCKETS
-- =========================================================================
-- Create one public bucket for item + post images.
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

drop policy if exists "Public read images" on storage.objects;
create policy "Public read images"
  on storage.objects for select
  using (bucket_id = 'images');

drop policy if exists "Authenticated uploads to images" on storage.objects;
create policy "Authenticated uploads to images"
  on storage.objects for insert
  with check (bucket_id = 'images' and auth.role() = 'authenticated');

drop policy if exists "Owner can update own images" on storage.objects;
create policy "Owner can update own images"
  on storage.objects for update
  using (bucket_id = 'images' and auth.uid() = owner);

drop policy if exists "Owner can delete own images" on storage.objects;
create policy "Owner can delete own images"
  on storage.objects for delete
  using (bucket_id = 'images' and auth.uid() = owner);
