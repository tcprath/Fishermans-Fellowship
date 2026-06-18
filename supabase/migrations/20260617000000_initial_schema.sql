-- updated_at trigger helper
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

-- blogs
create table if not exists public.blogs (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);
insert into public.blogs (slug, name, description) values
  ('fishermans-fellowship', 'Fisherman''s Fellowship',
   'Bringing Christian fishermen together to grow in faith, stand with one another, and share the love of Jesus — on the water and beyond.'),
  ('rise-up-gods-way', 'Rise Up God''s Way',
   'Biblical encouragement, personal discipleship, and practical guidance for living faithfully.')
on conflict (slug) do update set
  name        = excluded.name,
  description = excluded.description;

-- posts
create table if not exists public.posts (
  id             uuid primary key default gen_random_uuid(),
  blog_id        uuid not null references public.blogs(id) on delete restrict,
  slug           text not null,
  title          text not null,
  excerpt        text,
  body_html      text,
  hero_image_url text,
  author         text,
  status         text not null default 'draft' check (status in ('draft','published')),
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (blog_id, slug)
);
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'posts_updated') then
    create trigger posts_updated
      before update on public.posts
      for each row execute function set_updated_at();
  end if;
end $$;

-- devotionals
create table if not exists public.devotionals (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  scripture    text,
  excerpt      text,
  body_html    text,
  image_url    text not null,
  status       text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'devotionals_updated') then
    create trigger devotionals_updated
      before update on public.devotionals
      for each row execute function set_updated_at();
  end if;
end $$;

-- events (admin-managed, no external sync)
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  location    text,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  all_day     boolean not null default false,
  status      text not null default 'published' check (status in ('draft','published')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'events_updated') then
    create trigger events_updated
      before update on public.events
      for each row execute function set_updated_at();
  end if;
end $$;

-- contact / subscribe (service-role writes only; no anon insert policy)
create table if not exists public.contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text default 'website',
  created_at timestamptz not null default now()
);

-- RLS (safe to enable multiple times)
alter table public.blogs               enable row level security;
alter table public.posts               enable row level security;
alter table public.devotionals         enable row level security;
alter table public.events              enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.subscribers         enable row level security;

-- Public read policies (drop-and-recreate to stay idempotent)
do $$ begin
  drop policy if exists "blogs read"      on public.blogs;
  drop policy if exists "posts read pub"  on public.posts;
  drop policy if exists "devos read pub"  on public.devotionals;
  drop policy if exists "events read pub" on public.events;
  drop policy if exists "posts admin all" on public.posts;
  drop policy if exists "devos admin all" on public.devotionals;
  drop policy if exists "blogs admin all" on public.blogs;
  drop policy if exists "events admin all" on public.events;
end $$;

create policy "blogs read"      on public.blogs       for select using (true);
create policy "posts read pub"  on public.posts       for select using (status = 'published');
create policy "devos read pub"  on public.devotionals for select using (status = 'published');
create policy "events read pub" on public.events      for select using (status = 'published');

create policy "posts admin all"  on public.posts       for all to authenticated using (true) with check (true);
create policy "devos admin all"  on public.devotionals for all to authenticated using (true) with check (true);
create policy "blogs admin all"  on public.blogs       for all to authenticated using (true) with check (true);
create policy "events admin all" on public.events      for all to authenticated using (true) with check (true);
