-- tags (shared vocabulary across posts + devotionals)
create table if not exists public.tags (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id  uuid not null references public.tags(id)  on delete cascade,
  primary key (post_id, tag_id)
);

create table if not exists public.devotional_tags (
  devotional_id uuid not null references public.devotionals(id) on delete cascade,
  tag_id        uuid not null references public.tags(id)        on delete cascade,
  primary key (devotional_id, tag_id)
);

create index if not exists post_tags_tag_idx        on public.post_tags(tag_id);
create index if not exists devotional_tags_tag_idx  on public.devotional_tags(tag_id);

alter table public.tags             enable row level security;
alter table public.post_tags        enable row level security;
alter table public.devotional_tags  enable row level security;

do $$ begin
  drop policy if exists "tags read"             on public.tags;
  drop policy if exists "post_tags read"        on public.post_tags;
  drop policy if exists "devotional_tags read"  on public.devotional_tags;
  drop policy if exists "tags admin all"        on public.tags;
  drop policy if exists "post_tags admin all"   on public.post_tags;
  drop policy if exists "devotional_tags admin all" on public.devotional_tags;
end $$;

create policy "tags read"            on public.tags            for select using (true);
create policy "post_tags read"       on public.post_tags       for select using (true);
create policy "devotional_tags read" on public.devotional_tags for select using (true);

create policy "tags admin all"            on public.tags            for all to authenticated using (true) with check (true);
create policy "post_tags admin all"       on public.post_tags       for all to authenticated using (true) with check (true);
create policy "devotional_tags admin all" on public.devotional_tags for all to authenticated using (true) with check (true);
