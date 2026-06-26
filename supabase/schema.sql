-- Meow Meow cloud sync schema.
-- Run this in the Supabase SQL editor once your project is created.
-- The app stores ALL user data as a single jsonb blob (last-write-wins on last_updated).

create table if not exists public.cat_data (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  data         jsonb not null default '{}'::jsonb,
  last_updated timestamptz not null default now()
);

-- Row Level Security: a user can only read/write their own row.
alter table public.cat_data enable row level security;

create policy "own row - select"
  on public.cat_data for select
  using (auth.uid() = user_id);

create policy "own row - insert"
  on public.cat_data for insert
  with check (auth.uid() = user_id);

create policy "own row - update"
  on public.cat_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
