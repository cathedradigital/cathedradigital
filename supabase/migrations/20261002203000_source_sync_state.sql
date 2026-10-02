create table if not exists public.source_sync_state (
  source_kind text primary key check (source_kind in ('bible','catechism')),
  cursor integer not null default 0 check (cursor >= 0),
  items_processed integer not null default 0 check (items_processed >= 0),
  status text not null default 'pending' check (status in ('pending','running','completed','blocked','failed')),
  last_error text,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.source_sync_state enable row level security;

create index if not exists idx_source_sync_state_status on public.source_sync_state(status);

insert into public.source_sync_state (source_kind)
values ('bible'), ('catechism')
on conflict (source_kind) do nothing;
