-- Propuestas generadas con Claude + CRM de estados (correr después de schema.sql y roles.sql)
alter table public.proposals
  add column if not exists title text,
  add column if not exists client_name text,
  add column if not exists status text not null default 'borrador',
  add column if not exists content jsonb,
  add column if not exists chat jsonb not null default '[]'::jsonb,
  add column if not exists token uuid not null default gen_random_uuid(),
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();
alter table public.proposals alter column sent_at drop default;
alter table public.proposals alter column client_id drop not null;
alter table public.proposals drop constraint if exists proposals_status_check;
alter table public.proposals add constraint proposals_status_check
  check (status in ('borrador','enviada','en_negociacion','aceptada','rechazada'));
create unique index if not exists proposals_token_key on public.proposals(token);
create index if not exists proposals_status_idx on public.proposals(status, updated_at desc);
alter table public.proposals add column if not exists accepted_at timestamptz;
