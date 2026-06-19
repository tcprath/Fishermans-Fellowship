-- Add body_html for rich post-style resources
alter table public.resources
  add column if not exists body_html text;

-- Extend type check to include 'post'
alter table public.resources
  drop constraint if exists resources_type_check;
alter table public.resources
  add constraint resources_type_check
  check (type in ('post','book','video','podcast','study','article','link'));

-- URL is no longer required (post types live on this site)
alter table public.resources
  alter column url drop not null;
