-- Optional emoji for rooms and tasks (visual labels).
alter table public.rooms add column if not exists emoji text;
alter table public.tasks add column if not exists emoji text;
