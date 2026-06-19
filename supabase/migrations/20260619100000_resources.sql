create table if not exists public.resources (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text,
  type          text not null check (type in ('book','video','podcast','study','article','link')),
  url           text not null,
  image_url     text,
  author        text,
  featured      boolean not null default false,
  status        text not null default 'draft' check (status in ('draft','published')),
  published_at  timestamptz,
  publish_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'resources_updated') then
    create trigger resources_updated
      before update on public.resources
      for each row execute function set_updated_at();
  end if;
end $$;

create table if not exists public.resource_tags (
  resource_id uuid not null references public.resources(id) on delete cascade,
  tag_id      uuid not null references public.tags(id)      on delete cascade,
  primary key (resource_id, tag_id)
);

create index if not exists resource_tags_tag_idx on public.resource_tags(tag_id);

alter table public.resources      enable row level security;
alter table public.resource_tags  enable row level security;

do $$ begin
  drop policy if exists "resources read pub"   on public.resources;
  drop policy if exists "resources admin all"  on public.resources;
  drop policy if exists "resource_tags read"   on public.resource_tags;
  drop policy if exists "resource_tags admin"  on public.resource_tags;
end $$;

create policy "resources read pub"  on public.resources     for select using (status = 'published');
create policy "resources admin all" on public.resources     for all to authenticated using (true) with check (true);
create policy "resource_tags read"  on public.resource_tags for select using (true);
create policy "resource_tags admin" on public.resource_tags for all to authenticated using (true) with check (true);
