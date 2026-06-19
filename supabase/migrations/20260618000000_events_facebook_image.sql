alter table public.events
  add column if not exists facebook_event_url text,
  add column if not exists image_url          text;
